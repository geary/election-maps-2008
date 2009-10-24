#!/usr/bin/env ruby

require 'rubygems'
require 'hpricot'
require 'json'

STATE = 'va'  # 2009 temp
XML_PATH = "leo-#{STATE}.xml"
JSON_PATH = "leo-#{STATE}.json"

class Quit < Exception
end

def make_hash( root, fields )
	result = {}
	fields.each { |field|
		f = (root/field)
		result[field] = f.text if f.text != ''
	}
	result
end

def swapperoo( id )
	
	id == '47515' ? '47019' :
	id == '47019' ? '47515' :

	id == '47600' ? '47059' :
	id == '47059' ? '47600' :

	id == '47620' ? '47067' :
	id == '47067' ? '47620' :

	id == '47760' ? '47159' :
	id == '47159' ? '47760' :

	id == '47770' ? '47161' :
	id == '47161' ? '47770' :
	
	id

end

def fix_phone text
	text.sub!( /^(\d{3})(\d{3})(\d{4})$/, '(\1) \2-\3' ) if text
end

def convert
	counties = {}
	cities = {}
	admins = {}
	officials = {}

	print "Reading #{XML_PATH}\n"
	
	doc = Hpricot::XML( File.open( XML_PATH, 'r' ).read )
	vip = (doc/:vip_object)
	
	print "Getting election officials\n"
	
	(vip/:election_official).each { |official|
		id = official[:id]
		officials[id] = o = make_hash(
			official,
			#[ :name, :title, :phone, :fax, :email ]
			[ :name, :title, :phone, :fax, :email ]
		)
		fix_phone o[:phone]
		fix_phone o[:fax]
	}
	
	print "Getting election administrations\n"
	
	(vip/:election_administration).each { |admin|
		id = admin[:id]
		next if id.to_i < 10000  # skip state
		admins[id] = a = make_hash(
			admin,
			[ :name, :elections_url ]
		)
		a[:address] = address = make_hash(
			(admin/:physical_address),
			[ :location_name, :line1, :line2,  :city, :state, :zip ]
		)
		address.delete(:line2) if address[:line2] == a[:elections_url]
		a[:official] = officials[ (admin/:eo_id).text ]
	}
	
	print "Getting localities\n"
	
	mixups = []
	
	(vip/:locality).each { |locality|
		name = (locality/:name).text
		type = (locality/:type).text
		#admin = admins[ (locality/:election_administration_id).text ]
		admin_id = (locality/:election_administration_id).text
		admin_id = swapperoo admin_id
		admin = admins[admin_id]
		admin_name = admin[:name]
		oops = false
		if type == 'COUNTY'
			counties[ name.sub( / COUNTY$/, '' ) ] = admin
			oops = ! admin_name.match( / County General Registrar$/ )
		elsif type == 'Independent City'
			cities[ name.sub( / CITY$/, '' ) ] = admin
			oops = ! admin_name.match( / City General Registrar$/ )
		else
			print "#{name} is a #{type}, not a city or a county!\n"
		end
		if oops
				mixups.push "#{name} registrar is #{admin_name} in #{admin[:address][:city]} (id:#{admin_id})\n"
		end
	}
	
	print mixups.sort.join('')
	
	json = {
		:state => STATE,
		:cities => cities,
		:counties => counties
	}.to_json
	
	#print json
	
	print "Writing #{JSON_PATH}\n"
	
	File.open( JSON_PATH, 'w' ) { |f| f.write json }
end

begin
	convert
	print "Done!\n"
rescue Quit
	print "Error: #{$!}\n"
end
