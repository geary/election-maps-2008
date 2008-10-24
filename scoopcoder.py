#!/usr/bin/env python

import csv
import time

from geopy import geocoders

KEY = 'ABQIAAAAL7MXzZBubnPtVtBszDCxeRTqV_PyyxRizIwUkTfU6T-V7M7btRRpOM29SpcTDh2dojFpfRwpoTTMWw'

def main():
	g = geocoders.Google( KEY )
	reader = csv.reader( open( 'BenAndJerry.csv', 'rb' ) )
	writer = csv.writer( open( 'BenAndJerryGeo.csv', 'wb' ) )
	head = reader.next()
	head.append( 'Address' )
	head.append( 'Geocoded' )
	head.append( 'Latitude' )
	head.append( 'Longitude' )
	writer.writerow( head )
	n = 1
	good = bad = 0
	for row in reader:
		n += 1
		lat = lng = place = ''
		if row[13] != 'Yes':
			print 'Skip %d' % n
		else:
			addr = row[5] + ', ' + row[6] + ', ' + row[2] + ' ' + row[7]
			try:
				place, ( lat, lng ) = g.geocode( addr )
				good += 1
				print 'Good %d: %.5f, %.5f: %s' % ( n, lat, lng, place )
			except ValueError:
				lat = lng = place = '***FAIL***'
				bad += 1
				print 'Bad  %d: %s' % ( n, addr )
		row.append( addr )
		row.append( place )
		row.append( lat )
		row.append( lng )
		writer.writerow( row )
		time.sleep( 2 )
	print 'Good: %d, bad: %d' % ( good, bad )

if __name__ == '__main__':
    main()
