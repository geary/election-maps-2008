// Copyright 2010 Michael Geary
// http://mg.to/
// Free Beer and Free Speech License (any OSI license)
// http://freebeerfreespeech.org/

// Common initialization

var locationStrings = [
	'Arizona - Phoenix|American Banquet Hall~2713 W. Northern Ave~Phoenix, AZ 85051|-112.118337,33.5530682',
	'California - San Diego|1340 Broadway~El Cajon,  CA 92021|-116.93395100000001,32.808245899999996',
	'California - San Francisco|Alameda County Fairgrounds~4501 Pleasanton Avenue~Pleasanton, CA 94566|-121.887367,37.66169',
	'Illinois - Chicago|1919 A Pickwick Ln~Glenview, IL 60026|-87.8384481,42.09045020000001',
	'Michigan - Detroit|Dearborn Tree Manor (Banquet Centre)~5101 Oakman~Dearborn, MI 48126|-83.1688923,42.3245607',
	'Michigan - Detroit|Bella Banquets Hall~4100 E. 14 Mile Road~Warren, MI 48092|-83.0672744,42.5354603',
	'Tennessee - Nashville|4527 Nolensville Pike~Nashville, TN 37211|-86.72571599999999,36.070606999999995',
	'Texas - Dallas|Crossroads Hotel and Suites~3135 E. John Carpenter Fwy~Irving, TX 75062|-96.89966299999999,32.836512899999995',
	'Washington DC|Hilton Arlington Hotel~950 N. Stafford St~Arlington, VA 22203|-77.1104784,38.881823399999995'
];

var locations = [];

var opt = window.gadget ? gadget : window.mapplet ? mapplet : {};

(function() {

// Utility functions and jQuery extensions

var $window = $(window);

if( ! Array.prototype.forEach ) {
	Array.prototype.forEach = function( fun /*, thisp*/ ) {
		if( typeof fun != 'function' )
			throw new TypeError();
		
		var thisp = arguments[1];
		for( var i = 0, n = this.length;  i < n;  ++i ) {
			if( i in this )
				fun.call( thisp, this[i], i, this );
		}
	};
}

if( ! Array.prototype.map ) {
	Array.prototype.map = function( fun /*, thisp*/ ) {
		var len = this.length;
		if( typeof fun != 'function' )
			throw new TypeError();
		
		var res = new Array( len );
		var thisp = arguments[1];
		for( var i = 0;  i < len;  ++i ) {
			if( i in this )
				res[i] = fun.call( thisp, this[i], i, this );
		}
		
		return res;
	};
}

Array.prototype.mapjoin = function( fun, delim ) {
	return this.map( fun ).join( delim || '' );
};

function S() {
	return Array.prototype.join.call( arguments, '' );
}

function htmlEscape( str ) {
	var div = document.createElement( 'div' );
	div.appendChild( document.createTextNode( str ) );
	return div.innerHTML;
}

// GAsync v2 by Michael Geary
// Commented version and description at:
// http://mg.to/2007/06/22/write-the-same-code-for-google-mapplets-and-maps-api
// Free beer and free speech license. Enjoy!

function GAsync( obj ) {
	
	function callback() {
		args[nArgs].apply( null, results );
	}
	
	function queue( iResult, name, next ) {
		
		function ready( value ) {
			results[iResult] = value;
			if( ! --nCalls )
				callback();
		}
		
		var a = [];
		if( next.join )
			a = a.concat(next), ++iArg;
		if( mapplet ) {
			a.push( ready );
			obj[ name+'Async' ].apply( obj, a );
		}
		else {
			results[iResult] = obj[name].apply( obj, a );
		}
	}
	
	//var mapplet = ! window.GBrowserIsCompatible;
	
	var args = arguments, nArgs = args.length - 1;
	var results = [], nCalls = 0;
	
	for( var iArg = 1;  iArg < nArgs;  ++iArg ) {
		var name = args[iArg];
		if( typeof name == 'object' )
			obj = name;
		else
			queue( nCalls++, name, args[iArg+1] );
	}
	
	if( ! mapplet )
		callback();
}

var userAgent = navigator.userAgent.toLowerCase(),
	msie = /msie/.test( userAgent ) && !/opera/.test( userAgent );

var map = new GMap2;

var key = 'ABQIAAAAL7MXzZBubnPtVtBszDCxeRTZqGWfQErE9pT-IucjscazSdFnjBSzjqfxm1CQj7RDgG-OoyNfebJK0w';

document.write(
	'<style type="text/css">',
		'body.gadget { margin:0; padding:0; }',
		'#locations .address { margin-bottom:10px; }',
	'</style>',
	
	'<div style="font-size:125%; margin-bottom:12px;">',
		'Iraq Out Of Country Voter Info',
	'</div>',
	'<div id="locations">',
	'</div>'
);

function formatLocation( location, link ) {
	var address = location.address.replace( /~/g, '<br />' );
	if( link ) address = S(
		'<a href="#', location.index, '">', address.replace( /~/g, '<br />' ), '</a>'
	);
	return S(
		'<div style="font:10pt Arial,sans-serif">',
			'<div style="font-weight:bold; font-size:110%;">',
				location.city,
			'</div>',
			'<div class="address">',
				address,
			'</div>',
		'</div>'
	);
}

function addMarker( location ) {
	var latlng = new GLatLng( location.lat, location.lng );
	var icon = new GIcon( G_DEFAULT_ICON );
	var marker = new GMarker( latlng, { icon:icon } );
	map.addOverlay( marker );
	var options = {
		maxWidth: 350
		/*, disableGoogleLinks:true*/
	};
	var html = formatLocation( location );
	marker.bindInfoWindowHtml( html, options );
	return marker;
}
	
function getJSON( url, callback, cache ) {
	fetch( url, function( text ) {
		var json = typeof text == 'object' ? text : eval( '(' + text + ')' );
		callback( json );
	}, cache );
}

$(function() {
	$('#locations')
		.html(
			locationStrings.mapjoin( function( string, index ) {
				var loc = string.split('|');
				var ll = loc[2].split(',');
				var location = locations[index] = {
					index: index,
					city: loc[0],
					address: loc[1],
					lat: +ll[1],
					lng: +ll[0]
				};
				location.marker = addMarker( location );
				return formatLocation( location, true );
			})
		)
		.click( function( event ) {
			var $target = $(event.target);
			if( $target.is('a') ) {
				var index = $target.attr('href').split('#')[1];
				var location = locations[index];
				location.marker.openInfoWindowHtml( formatLocation(location) );
			}
			return false;
		});
});
	
})();
