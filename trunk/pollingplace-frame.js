var key = {
	'gigapad': 'ABQIAAAAgNQJhbWKFHRJJiHCXotPZxTCDaeoAnk9GZSdGi854AcXbJXoXRS9QqxqDWHL54Twi5thIIANaCUAeA',
	'gigapad.local': 'ABQIAAAAgNQJhbWKFHRJJiHCXotPZxTM3oEyKJfFfMe3pRkahPyHmmHL_xSjOVWnaIMs0gtUrFuoOJzsQiPnKA',
	'mg.to': 'ABQIAAAAL7MXzZBubnPtVtBszDCxeRQjDwyFD3YNj60GgWGUlJCU_q5i9hSSSzj0ergKKMY55eRpMa05FE3Wog',
	'padlet': 'ABQIAAAAL7MXzZBubnPtVtBszDCxeRSuIOvo2pGs7VouOPMgaUBd9TDiaBTE5gjPTrifBPED7VUFoeKD_Ysmkw',
	'padlet.local': 'ABQIAAAAgNQJhbWKFHRJJiHCXotPZxTbToHSggDWprRoD6gaXq5geEyxiBTRRmW6BwPHdCzJ2mh90uajjkpAOA',
	's.mg.to': 'ABQIAAAAL7MXzZBubnPtVtBszDCxeRQ9jbX8zKuYy1oz9F5p7GBNeAnoJRS9Itc8RizuhplTF59tia4NLgrdHQ',
	'': ''
}[location.host];

// TEST
var apimap = location.hash.slice(1,2) == 'a';
if( apimap )
	document.write(
		'<script type="text/javascript" src="http://maps.google.com/maps?file=api&amp;v=2&amp;key=', key, '">',
		'<\/script>'
	);
// END TEST

$(function() {

if( ! Array.prototype.forEach ) {
	Array.prototype.forEach = function( fun /*, thisp*/ ) {
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
		var res = new Array( len );
		var thisp = arguments[1];
		for( var i = 0;  i < len;  ++i ) {
			if( i in this )
				res[i] = fun.call( thisp, this[i], i, this );
		}
		
		return res;
	};
}

function S() {
	return Array.prototype.join.call( arguments, '' );
};

function htmlEscape( str ) {
	var div = document.createElement( 'div' );
	div.appendChild( document.createTextNode( str ) );
	return div.innerHTML;
}

function url( base, params, delim ) {
	var a = [];
	for( var p in params ) {
		var v = params[p];
		if( v != null ) a[a.length] = [ p, v ].join('=');
	}
	return a.length ? [ base, a.sort().join('&') ].join( delim || '?' ) : base;
};

function staticmap( params ) {
	return url( 'http://maps.google.com/staticmap', params );
}

function jsmap( a, link ) {
	GBrowserIsCompatible() && setTimeout( function() {
		var map = new GMap2( $('#Map')[0] );
		var latlng = new GLatLng( a.lat, a.lng );
		map.setCenter( latlng, a.zoom );
		//map.addControl( new GSmallMapControl );
		//map.addControl( new GMapTypeControl );
		var icon = new GIcon( G_DEFAULT_ICON );
		//icon.image = 'marker-green.png';
		var marker = new GMarker( latlng, { icon:icon } );
		map.addOverlay( marker );
		marker.openInfoWindowHtml( S(
			'<div>',
				'<div style="font-weight:bold;">',
					'Your Voting Place',
				'</div>',
				'<div>',
					a.street,
				'</div>',
				'<div>',
					a.city, ', ', a.state, ' ', a.zip,
				'</div>',
				'<div>',
					link,
				'</div>',
			'</div>'
		) );
	}, 1000 );
	
	return S(
		'<div id="Map" style="width:', a.width, 'px; height:', a.height /**/ + 75 /**/, 'px;">',
		'</div>'
	);
}

function spin( yes ) {
	//$('#PollingPlaceSearchSpinner').css({ backgroundPosition: yes ? '0px 0px' : '1000px 0px' });
}

var $box = $('#PollingPlaceSearchFrameBox');

function geocode( address, callback ) {
	var url = S(
		'http://maps.google.com/maps/geo?output=json&oe=utf-8&q=',
		encodeURIComponent(address), '&key=', key, '&callback=?'
	);
	$.getJSON( url, callback );
}

function lookup( address, callback ) {
	//var url = S(
	//	'http://somewhere.google.com/?address=',
	//	encodeURIComponent(address), '&callback=?'
	//);
	//$.getJSON( url, callback );
	
	// TEMP HACK
	setTimeout( function() {
		callback({
			errorcode: 2,
			address: ["507 Adair St.,Adair,50002"]
		});
	}, 250 );
}

function submit() {
	//var addr = decodeURIComponent( location.hash.slice(1) );
	var addr = decodeURIComponent( location.hash.slice(2) );
	$box.empty();
	
	geocode( addr, function( geo ) {
		var places = geo && geo.Placemark;
		var n = places && places.length;
		if( n == 0 ) {
			spin( false );
			$box.html( 'No match for that address.' );
		}
		else if( n == 1 ) {
			findPrecinct( places[0] );
		}
		else {
			$box.append( 'Select your address:' );
			$box.append( formatPlaces(places) );
			$('input:radio',$box).click( function() {
				spin( true );
				findPrecinct( places[ this.id.split('-')[1] ] );
			});
		}
	});
}

function findPrecinct( place ) {
	lookup( place.address, function( data ) {
		if( data.errorcode != 2 ) sorry();
		else geocode( data.address[0], function( geo ) {
			var places = geo && geo.Placemark;
			if( ! places  ||  places.length != 1 ) sorry();
			else set( formatPrecinct(places[0]) );
		});
	});
	
	function sorry() {
		set( 'Sorry, we did not find a polling place for this address' );
	}
	
	function set( html ) {
		$box.html( html );
	}
}

function formatPlaces( places ) {
	if( ! places ) return '<br />Check the address and spelling and click Search again.';
	
	var checked = '';
	if( places.length == 1 ) checked = 'checked="checked" ';
	else spin( false );
	var list = places.map( function( place, i ) {
		var id = 'PollingPlaceSearchPlaceRadio-' + i;
		place.extra = { index:i, id:id };
		return S(
			'<tr class="PollingPlaceSearchPlace" style="vertical-align:top;">',
				'<td>',
					'<input type="radio" ', checked, 'name="PollingPlaceSearchPlaceRadio" class="PollingPlaceSearchPlaceRadio" id="', id, '" />',
				'</td>',
				'<td>',
					'<div>',
						'<label for="', id, '" class="PollingPlaceSearchPlaceAddress">',
							htmlEscape( place.address.replace( /, USA$/, '' ) ),
						'</label>',
					'</div>',
				'</td>',
			'</tr>'
		);
	});
	
	return S(
		'<table id="PollingPlaceSearchPlaces" cellspacing="0">',
			list.join(''),
		'</table>'
	);
}

function formatPrecinct( place ) {
	var address = place.address.replace( /, USA$/, '' );
	var area = place.AddressDetails.Country.AdministrativeArea;
	var sub = area.SubAdministrativeArea || area;
	var locality = sub.Locality;
	var coord = place.Point.coordinates;
	var a = {
		lat: coord[1],
		lng: coord[0],
		street: locality.Thoroughfare.ThoroughfareName,
		city: locality.LocalityName,
		state: area.AdministrativeAreaName,
		zip: locality.PostalCode.PostalCodeNumber,
		width: 450, // $box.width()
		height: 300,  //
		zoom: 15,
		_:''
	}
	var latlng = [ a.lat, a.lng ].join();
	var map = apimap ?  jsmap( a, link('Large map and directions') ) : S(
		staticmap({
			key: key,
			center: latlng,
			zoom: a.zoom,
			size: [ a.width, a.height ].join('x'),
			markers: [ latlng, 'green' ].join()
		})
	);
	function link( html ) {
		return S(
			'<a target="_blank" href="http://maps.google.com/maps?f=q&hl=en&geocode=&q=', encodeURIComponent( address.replace( / /g, '+' ) ), '&ie=UTF8&ll=', a.latlng, '&z=15&iwloc=addr">',
				html,
			'</a>'
		);
	}
	if( apimap )
		return map;
	
	return S(
		'<div>',
			'<div style="font-weight:bold;">',
				'Your Voting Place',
			'</div>',
			'<div>',
				a.street,
			'</div>',
			'<div>',
				a.city, ', ', a.state, ' ', a.zip,
			'</div>',
			'<div>',
				link( 'Large map and directions' ),
			'</div>',
		'</div>',
		'<div style="margin-top:6px;">',
			link(S(
				'<img style="border:0; width:', a.width, 'px; height:', a.height, 'px;" src="', map, '" alt="', address, '" title="Your voting place: ', address, '" />'
			)),
		'</div>'
	);
}

submit();

});
