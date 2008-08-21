var base = {
	image: 'http://s.mg.to/elections/'
}

function parseQuery( query ) {
	var params = {};
	if( query ) {
		var array = query.split( '&' );
		for( var i = 0, n = array.length;  i < n;  ++i ) {
			var p = array[i].split( '=' ),
				k = decodeURIComponent(p[0]),
				v = decodeURIComponent(p[1]);
			if( k ) params[k] = v;
		}
	}
	return params;
}

var params = parseQuery( unescape(location.search).replace( /^\?[^?]*\?/, '' ) );

function S() {
	return Array.prototype.join.call( arguments, '' );
};

function htmlEscape( str ) {
	var div = document.createElement( 'div' );
	div.appendChild( document.createTextNode( str ) );
	return div.innerHTML;
}

var userAgent = navigator.userAgent.toLowerCase(),
	msie = /msie/.test( userAgent ) && !/opera/.test( userAgent );

var localsearch = ! msie;

mapplet = window.mapplet;
var $jsmap, currentAddress;
var home = {}, vote = {};

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
		'#wrapper, #wrapper * { font-family:Arial,sans-serif; font-size:10pt; }',
		'#spinner { z-index: 1; position:absolute; width:100%; height:100%; background-image:url(spinner.gif); background-position:center; background-repeat:no-repeat; opacity:0.30; -moz-opacity:0.30; }',
		'#spinner { filter:alpha(opacity=30); }',
		'#title { margin-bottom:4px; }',
		'#title, #map { overflow: auto; }',
	'</style>'
);

if( mapplet ) {
	document.write(
		'<style type="text/css">',
			'#PollingPlaceSearch, #PollingPlaceSearch td { font-size:14px; width:100%; margin:0; padding:0; }',
			'.PollingPlaceSearchForm { margin:0; padding:0; }',
			'.PollingPlaceSearchTitle { /*font-weight:bold;*/ font-size:110%; padding-bottom:4px; }',
			//'/*.PollingPlaceSearchSpinner { float:right; margin-right:4px; width:16px; height:16px; background-image:url(spinner16.gif); background-position:1000px 0px; background-repeat:no-repeat; }*/',
			//'.PollingPlaceSearchLabelBox { position:relative; float:left; margin-right:6px; }',
			'.PollingPlaceSearchLabel { color:#777; cursor: text; }',
			'.PollingPlaceSearchInput { width:100%; }',
			'#title { margin-top:12px; }',
		'</style>',
		'<div id="PollingPlaceSearch">',
			'<div class="PollingPlaceSearchTitle">',
				'Find your voting location, registration information and more. ',
				'To get started, enter&nbsp;your&nbsp;<strong>home</strong>&nbsp;address:',
			'</div>',
			'<!--<div id="PollingPlaceSearchSpinner" class="PollingPlaceSearchSpinner">-->',
			'<!--</div>-->',
			'<form id="PollingPlaceSearchForm" class="PollingPlaceSearchForm" onsubmit="return PollingPlaceSearch.submit()">',
				'<table style="width:100%;">',
					'<tr>',
						'<td style="width:99%;">',
							'<div>',
								'<input id="PollingPlaceSearchInput" class="PollingPlaceSearchInput" type="text" value="',
									htmlEscape( ( params.home || '' ).replace( /!/g, ' ' ) ),
								'" />',
							'</div>',
						'</td>',
						'<td style="width:1%;">',
							'<div>',
								'<button type="submit" id="PollingPlaceSearchButton" class="PollingPlaceSearchButton"> Search</button>',
							'</div>',
						'</td>',
					'</tr>',
				'</table>',
				'<div>',
					'<label id="PollingPlaceSearchLabel" for="PollingPlaceSearchInput" class="PollingPlaceSearchLabel">',
						'Example: 1600 Pennsylvania Ave 20500',
					'</label>',
				'<div>',
			'</form>',
		'</div>'
	);
}
else {
	document.write(
		'<script type="text/javascript" src="http://maps.google.com/maps?file=api&amp;v=2&amp;key=', key, '">',
		'<\/script>'
	);
	if( localsearch )
		document.write(
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

writeBody = function() {
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
};

if( mapplet )
	writeBody();

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
		$jsmap = $('#jsmap');
		var map = new GMap2( $jsmap[0], {
			mapTypes: [
				G_NORMAL_MAP,
				G_SATELLITE_MAP,
				G_SATELLITE_3D_MAP
			]
		});
		initMap( a, map );
	}, 1 );
}

function initMap( a, map ) {
	//var largeMapLink = mapplet ? '' : S(
	//	'<div style="padding-top:0.5em;">',
	//		'<a target="_blank" href="http://maps.google.com/maps?f=q&hl=en&geocode=&q=', encodeURIComponent( a.address.replace( / /g, '+' ) ), '&ie=UTF8&ll=', latlng, '&z=15&iwloc=addr">',
	//			'Large map and directions &#187;',
	//		'</a>',
	//	'</div>'
	//);
	var location = formatLocation( a, 'vote-icon-50.png', 'Your Voting Location' );
	var extra = S(
		'<div style="padding-top:0.5em;">',
			'<a target="_blank" href="http://maps.google.com/maps?f=d&saddr=', encodeURIComponent(home.info.address), '&daddr=', encodeURIComponent(vote.info.address), '&hl=en&mra=ls&ie=UTF8&iwloc=A&iwstate1=dir">',
				'Get directions',
			'</a>',
			' - ',
			'<a target="_blank" href="http://maps.google.com/maps?f=q&hl=en&geocode=&q=polling+places+loc+', encodeURIComponent( a.address.replace( / /g, '+' ) ), '&ie=UTF8&z=15&iwloc=A&iwstate1=stp">',
				'Send',
			'</a>',
		'</div>',
		'<div style="padding-top:0.5em;">',
			'<a target="_blank" href="http://maps.google.com/maps?f=q&hl=en&geocode=&q=', encodeURIComponent( a.address.replace( / /g, '+' ) ), '&ie=UTF8&ll=', latlng, '&z=15&iwloc=addr">',
				'Registration details, election officials, and more',
			'</a>',
		'</div>',
		'<div style="padding-top:0.5em; line-height:1.2em; color:gray; font-size:80%;">',
			'This is a voting location for the US election on November 4, 2008. ',
			'Please check with your state or local election officials to verify your voting location.',
		'</div>'
	);
	if( mapplet ) $title.append( S(
		'<div style="padding-top:0.5em;">',
			location,
		'</div>'
	));
	vote.html = S(
		'<div style="font-family:Arial,sans-serif; font-size:10pt;">',
			location,
			extra,
		'</div>'
	);
	
	function ready() {
		setTimeout( function() {
			setMarker({ place:home, image:base.image+'marker-green.png' });
			setMarker({ place:vote, open:true });
		}, 500 );
	}
	
	function setMarker( a ) {
		var icon = new GIcon( G_DEFAULT_ICON );
		if( a.image ) icon.image = a.image;  // TODO!
		var marker = a.place.marker = new GMarker(
			new GLatLng( a.place.info.lat, a.place.info.lng ),
			{ icon:icon }
		);
		map.addOverlay( marker );
		var options = {
			maxWidth: mapplet ? 375 : Math.min( $jsmap.width() - 125, 375 )
			/*, disableGoogleLinks:true*/
		};
		marker.bindInfoWindow( $(a.place.html)[0], options );
		if( a.open ) marker.openInfoWindowHtml( a.place.html, options );
	}
	
	if( ! mapplet )
		GEvent.addListener( map, 'load', ready );
	
	// Initial position with marker centered
	var latlng = vote.latlng = new GLatLng( a.lat, a.lng ), center = latlng;
	//var width = $jsmap.width(), height = $jsmap.height();
	map.setCenter( latlng, a.zoom );
	if( ! mapplet ) {
		// Move map down a bit
		//var point = map.fromLatLngToDivPixel( latlng );
		//point = new GPoint(
		//	point.x /*- width * .075*/,
		//	point.y - height * .275
		//);
		//map.setCenter( map.fromDivPixelToLatLng(point), a.zoom );
		map.addControl( new GSmallMapControl );
		map.addControl( new GMapTypeControl );
		if( localsearch ) {
			//alert( window.GControl );
			//debugger;
			//map.addControl(
			//	new google.maps.LocalSearch(),
			//	new GControlPosition( G_ANCHOR_BOTTOM_RIGHT, new GSize(10,20) )
			//);
			var gls = new google.maps.LocalSearch();
			var gs = new GSize(10,20);
			var gcp = new GControlPosition( G_ANCHOR_BOTTOM_RIGHT, gs )
			map.addControl( gls, gcp );
		}
	}
	if( mapplet )
		ready();
	spin( false );
}

function formatLocation( a, icon, title ) {
	return S(
		'<div style="font-weight:bold; font-size:110%;">',
			title,
		'</div>',
		'<div style="padding-top:0.5em;">',
			'<table cellpadding="0" cellspacing="0">',
				'<tr valign="middle">',
					'<td style="width:50px; padding-right:.75em;">',
						'<img src="', base.image, icon, '" style="width:50px; height:50px;" />',
					'</td>',
					'<td>',
						'<div>',
							a.street,
						'</div>',
						'<div>',
							a.city, ', ', a.state, ' ', a.zip,
						'</div>',
					'</td>',
				'</tr>',
			'</table>',
		'</div>'
	);
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
	currentAddress = addr;
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
			if( places ) {
				$title.append( S(
					'<div style="padding-top:0.5em;">',
						'<strong>Select your address:</strong>',
					'</div>'
				));
				$title.append( formatPlaces(places) );
				$('input:radio',$title).click( function() {
					spin( true );
					findPrecinct( places[ this.id.split('-')[1] ] );
				});
			}
			else {
				$title.append( sorryHtml() );
			}
		}
	});
}

function findPrecinct( place ) {
	home.info = mapInfo( place );
	var address = currentAddress = place.address;
	var style = mapplet ? ' style="padding-top:0.5em;"' : '';
	var location = formatLocation( home.info, 'home-icon-50.png', 'Your Home' );
	home.html = S(
		'<div style="font-family:Arial,sans-serif; font-size:10pt;">',
			location,
		'</div>'
	);
	$title.html( location );
	lookup( address, function( data ) {
		if( data.errorcode != 2 ) sorry();
		else geocode( data.address[0], function( geo ) {
			var places = geo && geo.Placemark;
			if( ! places  ||  places.length != 1 ) sorry();
			else setMap( places[0] );
		});
	});
}

function sorry() {
	$map.html( sorryHtml() );
	spin( false );
}

function sorryHtml() {
	return S(
		'<div>',
			'<div style="padding-top:0.5em;">',
				'<strong>', window.currentAddress || '', '</strong> does not appear to be a home address.',
			'</div>',
			'<div style="padding-top:0.5em;">',
				'Suggestions:',
			'</div>',
			'<ul>',
				'<li>Make sure all street and city names are spelled correctly.</li>',
				'<li>Make sure your address includes a street and number.</li>',
				'<li>Make sure your address includes a city and state, or a zip code.</li>',
			'</ul>',
		'</div>'
	);
}

function setMap( place ) {
	var a = vote.info = mapInfo( place );
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
	if( ! places ) return sorryHtml();
	
	var checked = '';
	if( places.length == 1 ) checked = 'checked="checked" ';
	else spin( false );
	var list = places.map( function( place, i ) {
		var id = 'PollingPlaceSearchPlaceRadio-' + i;
		place.extra = { index:i, id:id };
		return S(
			'<tr class="PollingPlaceSearchPlace" style="vertical-align:top;">',
				'<td style="width:1%; padding:2px 0;">',
					'<input type="radio" ', checked, 'name="PollingPlaceSearchPlaceRadio" class="PollingPlaceSearchPlaceRadio" id="', id, '" />',
				'</td>',
				'<td style="width:99%; padding:5px 0 2px 2px;">',
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
		if( params.home ) PollingPlaceSearch.submit();
	})();
}
else {
	submit( decodeURIComponent( location.hash.slice(1) ) );
}

});
