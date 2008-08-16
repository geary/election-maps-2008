mapplet = window.mapplet;

var key = {
	'gigapad': 'ABQIAAAAgNQJhbWKFHRJJiHCXotPZxTCDaeoAnk9GZSdGi854AcXbJXoXRS9QqxqDWHL54Twi5thIIANaCUAeA',
	'gigapad.local': 'ABQIAAAAgNQJhbWKFHRJJiHCXotPZxTM3oEyKJfFfMe3pRkahPyHmmHL_xSjOVWnaIMs0gtUrFuoOJzsQiPnKA',
	'maps.gmodules.com': 'ABQIAAAAL7MXzZBubnPtVtBszDCxeRTqV_PyyxRizIwUkTfU6T-V7M7btRRpOM29SpcTDh2dojFpfRwpoTTMWw',
	'mg.to': 'ABQIAAAAL7MXzZBubnPtVtBszDCxeRQjDwyFD3YNj60GgWGUlJCU_q5i9hSSSzj0ergKKMY55eRpMa05FE3Wog',
	'padlet': 'ABQIAAAAL7MXzZBubnPtVtBszDCxeRSuIOvo2pGs7VouOPMgaUBd9TDiaBTE5gjPTrifBPED7VUFoeKD_Ysmkw',
	'padlet.local': 'ABQIAAAAgNQJhbWKFHRJJiHCXotPZxTbToHSggDWprRoD6gaXq5geEyxiBTRRmW6BwPHdCzJ2mh90uajjkpAOA',
	's.mg.to': 'ABQIAAAAL7MXzZBubnPtVtBszDCxeRQ9jbX8zKuYy1oz9F5p7GBNeAnoJRS9Itc8RizuhplTF59tia4NLgrdHQ',
	'': ''
}[location.host];

document.write(
	'<style type="text/css">',
		'body.gadget { margin:0; padding:0; }',
		'#wrapper { font-family:Arial,sans-serif; font-size:10pt; }',
		'#spinner { z-index: 1; position:absolute; width:100%; height:100%; background-image:url(spinner.gif); background-position:center; background-repeat:no-repeat; opacity:0.30; -moz-opacity:0.30; }',
		'#spinner { filter:alpha(opacity=30); }',
		'#title { margin-bottom:4px; }',
		'#title, #map { overflow: auto; }',
	'</style>'
);

if( mapplet ) {
	document.write(
		'<style type="text/css">',
			'#PollingPlaceSearch { font-size:14px; width:100%; margin:0; padding:0; }',
			'.PollingPlaceSearchForm { margin:0; padding:0; }',
			'.PollingPlaceSearchTitle { float:left; /*font-weight:bold;*/ font-size:120%; padding-bottom:4px; }',
			'/*.PollingPlaceSearchSpinner { float:right; margin-right:4px; width:16px; height:16px; background-image:url(spinner16.gif); background-position:1000px 0px; background-repeat:no-repeat; }*/',
			'.PollingPlaceSearchLabelBox { position:relative; float:left; margin-right:6px; }',
			'.PollingPlaceSearchLabel { position:absolute; left:5px; top:5px; z-index:1; color:#777; cursor: text; }',
			'.PollingPlaceSearchInput { width:18.5em; }',
			'.PollingPlaceSearchButtonBox { float:left; }',
			'.PollingPlaceSearchButton { width:4em; }',
		'</style>',
		'<div id="PollingPlaceSearch">',
			'<div class="PollingPlaceSearchTitle">',
				'Enter your <strong>home</strong> address:',
			'</div>',
			'<!--<div id="PollingPlaceSearchSpinner" class="PollingPlaceSearchSpinner">-->',
			'<!--</div>-->',
			'<div style="clear:both;">',
			'</div>',
			'<form id="PollingPlaceSearchForm" class="PollingPlaceSearchForm">',
				'<div class="PollingPlaceSearchLabelBox">',
					'<label id="PollingPlaceSearchLabel" for="PollingPlaceSearchInput" class="PollingPlaceSearchLabel">',
						'1600 Pennsylvania Ave, Washington, DC',
					'</label>',
					'<input id="PollingPlaceSearchInput" class="PollingPlaceSearchInput" type="text" onfocus="PollingPlaceSearch.focus()" onblur="PollingPlaceSearch.blur()" />',
				'</div>',
				'<div class="PollingPlaceSearchButtonBox">',
					'<button type="submit" id="PollingPlaceSearchButton" class="PollingPlaceSearchButton" onclick="return PollingPlaceSearch.submit()"> Search</button>',
				'</div>',
			'</form>',
			'<div style="clear:left;">',
			'</div>',
		'</div>'
	);
}
else {
	document.write(
		'<script type="text/javascript" src="http://maps.google.com/maps?file=api&amp;v=2&amp;key=', key, '">',
		'<\/script>',
		'<script type="text/javascript" src="http://www.google.com/uds/api?file=uds.js&v=1.0&key=', key, '">',
		'<\/script>',
		'<script type="text/javascript" src="http://www.google.com/uds/solutions/localsearch/gmlocalsearch.js">',
		'<\/script>',
	    '<style type="text/css">',
			'@import url("http://www.google.com/uds/css/gsearch.css");',
			'@import url("http://www.google.com/uds/solutions/localsearch/gmlocalsearch.css");',
	   '</style>'
	);
}

document.write(
	'<div id="spinner">',
	'</div>',
	'<div id="wrapper">',
		'<div id="title">',
		'</div>',
		'<div id="map">',
		'</div>',
	'</div>'
);

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

function loadMap( a ) {
	GBrowserIsCompatible() && setTimeout( function() {
		a.$jsmap = $('#jsmap');
		var map = new GMap2( a.$jsmap[0], {
			mapTypes: [
				G_NORMAL_MAP,
				G_SATELLITE_MAP,
				G_SATELLITE_3D_MAP
			]
		} );
		initMap( a, map );
	}, 1 );
}

function initMap( a, map ) {
	// Initial position with marker centered
	var latlng = new GLatLng( a.lat, a.lng ), center = latlng;
	map.setCenter( latlng, a.zoom );
	if( ! mapplet ) {
		// Move map down a bit
		var point = map.fromLatLngToDivPixel( latlng );
		point = new GPoint(
			point.x /*- a.$jsmap.width() * .075*/,
			point.y - a.$jsmap.height() * .275
		);
		map.setCenter( map.fromDivPixelToLatLng(point), a.zoom );
		map.addControl( new GSmallMapControl );
		map.addControl( new GMapTypeControl );
		
		map.addControl(
			new google.maps.LocalSearch(),
			new GControlPosition( G_ANCHOR_BOTTOM_RIGHT, new GSize(10,20) )
		);
	}
	var icon = new GIcon( G_DEFAULT_ICON );
	//icon.image = 'marker-green.png';
	var marker = new GMarker( latlng, { icon:icon } );
	map.addOverlay( marker );
	var largeMapLink = mapplet ? '' : S(
		'<div style="padding-top:0.5em;">',
			'<a target="_blank" href="http://maps.google.com/maps?f=q&hl=en&geocode=&q=', encodeURIComponent( a.address.replace( / /g, '+' ) ), '&ie=UTF8&ll=', latlng, '&z=15&iwloc=addr">',
				'Large map and directions &#187;',
			'</a>',
		'</div>'
	);
	var location = S(
		'<div>',
			'<div style="font-weight:bold; font-size:110%;">',
				'Your Voting Place',
			'</div>',
			'<div style="padding-top:0.5em;">',
				'<div>',
					a.street,
				'</div>',
				'<div>',
					a.city, ', ', a.state, ' ', a.zip,
				'</div>',
			'</div>',
		'</div>'
	);
	if( mapplet ) $title.append( S(
		'<div style="padding-top:0.5em;">',
			location,
		'</div>'
	));
	var html = S(
		'<div style="font-family:Arial,sans-serif; font-size:10pt;">',
			location,
			largeMapLink,
		'</div>'
	);
	marker.bindInfoWindowHtml( html );
	marker.openInfoWindowHtml( html );
	spin( false );
}

function spin( yes ) {
	//console.log( 'spin', yes );
	$('#spinner').css({ visibility: yes ? 'visible' : 'hidden' });
}

function geocode( address, callback ) {
	var url = S(
		'http://maps.google.com/maps/geo?output=json&oe=utf-8&q=',
		encodeURIComponent(address), '&key=', key, '&callback=?'
	);
	$.getJSON( url, callback );
}

function lookup( address, callback ) {
	//var url = S(
	//	'http://pollinglocation.apis.google.com/?q=',
	//	encodeURIComponent(address), '&callback=?'
	//);
	var url = S( 'http://s.mg.to/elections/proxy.php?callback=?&q=', encodeURIComponent(address) );
	
	$.getJSON( url, callback );
}

function submit( addr ) {
	$title.empty();
	$map.empty();
	
	geocode( addr, function( geo ) {
		var places = geo && geo.Placemark;
		var n = places && places.length;
		if( n == 0 ) {
			spin( false );
			$title.html( 'No match for that address.' );
		}
		else if( n == 1 ) {
			findPrecinct( places[0] );
		}
		else {
			$title.append( 'Select your address:' );
			$title.append( formatPlaces(places) );
			$('input:radio',$title).click( function() {
				spin( true );
				findPrecinct( places[ this.id.split('-')[1] ] );
			});
		}
	});
}

function findPrecinct( place ) {
	var style = mapplet ? ' style="padding-top:0.5em;"' : '';
	$title.html( S(
		'<div', style, '>',
			'<strong style="font-size:110%;">Your Home</strong>',
			'<div', style, '>',
				htmlEscape( place.address.replace( /, USA$/, '' ) ),
			'</div>',
		'</div>'
	));
	lookup( place.address, function( data ) {
		if( data.errorcode != 2 ) sorry();
		else geocode( data.address[0], function( geo ) {
			var places = geo && geo.Placemark;
			if( ! places  ||  places.length != 1 ) sorry();
			else setMap( places[0] );
		});
	});
}

function sorry() {
	$map.html( '<strong>Sorry, we did not find a polling place for this address.</strong>' );
	spin( false );
}

function setMap( place ) {
	var a = mapInfo( place );
	if( mapplet ) {
		initMap( a, new GMap2 );
	}
	else {
		a.width = $map.width();
		$map.height( a.height = $window.height() - $map.offset().top );
		$map.html( formatMap(a) );
		loadMap( a );
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

function mapInfo( place ) {
	var area = place.AddressDetails.Country.AdministrativeArea;
	var sub = area.SubAdministrativeArea || area;
	var locality = sub.Locality;
	var coord = place.Point.coordinates;
	return {
		address: place.address.replace( /, USA$/, '' ),
		lat: coord[1],
		lng: coord[0],
		street: locality.Thoroughfare.ThoroughfareName,
		city: locality.LocalityName,
		state: area.AdministrativeAreaName,
		zip: locality.PostalCode.PostalCodeNumber,
		zoom: 15,
		_:''
	};
}

function formatMap( a ) {
	return S(
		'<div id="jsmap" style="width:', a.width, 'px; height:', a.height, 'px;">',
		'</div>'
	);
}

var $window = $(window), $title = $('#title'), $map = $('#map'), $spinner = $('#spinner');

if( mapplet ) {
	(function() {
		function e( id ) { return document.getElementById('PollingPlaceSearch'+id); }
		var /*spinner = e('Spinner'),*/ label = e('Label'), input = e('Input'), button = e('Button');
		button.disabled = false;
		
		window.PollingPlaceSearch = {
			
			focus: function() {
				label.style.textIndent = '-1000px';
			},
			
			blur: function() {
				if( input.value === '' )
					label.style.textIndent = '0px';
			},
			
			submit: function() {
				//spinner.style.backgroundPosition = '0px 0px';
				submit( input.value );
				return false;
			}
			
		};
		
		PollingPlaceSearch.focus();
		PollingPlaceSearch.blur();
	})();
}
else {
	submit( decodeURIComponent( location.hash.slice(1) ) );
}

});
