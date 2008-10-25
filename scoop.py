#!/usr/bin/env python

import csv
import simplejson as sj

#from geopy import distance
import distance
distance.distance = distance.GreatCircleDistance 

def find( req, lat, lng ):
	lat = float( lat )
	lng = float( lng )
	bestRow = None
	reader = csv.reader( open( 'BenAndJerryGeo.csv', 'rb' ) )
	head = reader.next()
	for row in reader:
		rlat = row[16]
		rlng = row[17]
		if rlat == '' or rlat == '***FAIL***':
			continue
		miles = distance.distance( (lat,lng), (float(rlat),float(rlng) ) ).miles
		if bestRow == None or bestMiles > miles:
			bestRow = row
			bestMiles = miles
	json = sj.dumps({
		'address': bestRow[15],
		'distance': bestMiles,
		'lat': float(bestRow[16]),
		'lng': float(bestRow[17])
	}, separators=( ',', ':' ) )
	return json

def main():
	print find( None, '37', '-122' )

if __name__ == '__main__':
    main()
