// Copyright 2008 Michael Geary
// http://mg.to/
// Free Beer and Free Speech License (any OSI license)
// http://freebeerfreespeech.org/

var opt = window.gadget ? gadget : window.mapplet ? mapplet : {};

var baseUrl = opt.baseUrl || 'http://poll411.s3.amazonaws.com/';
var dataUrl = opt.dataUrl || baseUrl;

var today = new Date;
today.setHours( 0, 0, 0, 0 );
var electionDay = new Date( 2008, 10, 4 );

var sampleAddr = '1600 Pennsylvania Ave 20006';

function writeScript( url ) {
	document.write( '<script type="text/javascript" src="', url, '"></script>' );
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

var params = parseQuery(
	unescape(location.search)
		.replace( /^\?[^?]*\?/, '' )
		.replace( '#', '&' )
);

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

function cacheUrl( url, cache, always ) {
	if( opt.nocache  &&  ! always ) return url + '?q=' + new Date().getTime();
	if( opt.nocache ) cache = 0;
	if( typeof cache != 'number' ) cache = 300;
	url = _IG_GetCachedUrl( url, { refreshInterval:cache } );
	if( ! url.match(/^http:/) ) url = 'http://' + location.host + url;
	return url;
}

var stateUS = {
	abbr: 'US',
	name: 'United States',
	gsx$north: { $t: '49.3836' },
	gsx$south: { $t: '24.5457' },
	gsx$east: { $t: '-66.9522' },
	gsx$west: { $t: '-124.7284' }
};

var states = [];
var statesByAbbr = {};
var statesByName = {};

function stateByAbbr( abbr ) {
	if( typeof abbr != 'string' ) return abbr;
	return statesByAbbr[abbr.toUpperCase()] || stateUS;
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

var localsearch = ! msie;

mapplet = window.mapplet;
var map, $jsmap, currentAddress;
var home, vote;

var key = {
	'gigapad': 'ABQIAAAAgNQJhbWKFHRJJiHCXotPZxTCDaeoAnk9GZSdGi854AcXbJXoXRS9QqxqDWHL54Twi5thIIANaCUAeA',
	'gigapad.local': 'ABQIAAAAgNQJhbWKFHRJJiHCXotPZxTM3oEyKJfFfMe3pRkahPyHmmHL_xSjOVWnaIMs0gtUrFuoOJzsQiPnKA',
	'gmodules.com': 'ABQIAAAAL7MXzZBubnPtVtBszDCxeRTZqGWfQErE9pT-IucjscazSdFnjBSzjqfxm1CQj7RDgG-OoyNfebJK0w',
	'maps.gmodules.com': 'ABQIAAAAL7MXzZBubnPtVtBszDCxeRTqV_PyyxRizIwUkTfU6T-V7M7btRRpOM29SpcTDh2dojFpfRwpoTTMWw',
	'mg.to': 'ABQIAAAAL7MXzZBubnPtVtBszDCxeRQjDwyFD3YNj60GgWGUlJCU_q5i9hSSSzj0ergKKMY55eRpMa05FE3Wog',
	'padlet': 'ABQIAAAAL7MXzZBubnPtVtBszDCxeRSuIOvo2pGs7VouOPMgaUBd9TDiaBTE5gjPTrifBPED7VUFoeKD_Ysmkw',
	'padlet.local': 'ABQIAAAAgNQJhbWKFHRJJiHCXotPZxTbToHSggDWprRoD6gaXq5geEyxiBTRRmW6BwPHdCzJ2mh90uajjkpAOA',
	's.mg.to': 'ABQIAAAAL7MXzZBubnPtVtBszDCxeRQ9jbX8zKuYy1oz9F5p7GBNeAnoJRS9Itc8RizuhplTF59tia4NLgrdHQ',
	'www.gmodules.com': 'ABQIAAAAL7MXzZBubnPtVtBszDCxeRSf0RMTBV-KKR6hvCL9Kx2eVMqFbxQJkQOf-iqm2g6XkyYWJQsN9S97qg',
	'': ''
}[location.host];

document.write(
	'<style type="text/css">',
		'body.gadget { margin:0; padding:0; }',
		'#wrapper, #wrapper * { font-family:Arial,sans-serif; font-size:10pt; }',
		'#title { margin-bottom:4px; }',
		'#title, #mapbox { overflow: auto; }',
		'.heading { font-weight:bold; font-size:110%; }',
		params.home ? '.removehelp { display:none; }' : '',
	'</style>'
);

if( mapplet ) {
	document.write(
		'<style type="text/css">',
			'#PollingPlaceSearch, #PollingPlaceSearch td { font-size:10pt; margin:0; padding:0; }',
			'#PollingPlaceSearch { background-color:#E8ECF9; margin:0; padding:6px; width:95%; }',
			'.PollingPlaceSearchForm { margin:0; padding:0; }',
			'.PollingPlaceSearchTitle { /*font-weight:bold;*/ /*font-size:110%;*/ /*padding-bottom:4px;*/ }',
			//'.PollingPlaceSearchLabelBox { position:relative; float:left; margin-right:6px; }',
			'.PollingPlaceSearchInput { width:100%; }',
			'#title { margin-top:12px; }',
		'</style>'
	);
}
else {
	document.write(
		'<style type="text/css">',
			'#spinner { z-index: 1; position:absolute; width:100%; height:100%; background-image:url(', baseUrl, 'spinner.gif); background-position:center; background-repeat:no-repeat; opacity:0.30; -moz-opacity:0.30; }',
			'#spinner { filter:alpha(opacity=30); }',
		'</style>'
	);
}

if( mapplet ) {
	document.write(
		'<div id="outerlimits" style="margin-right:8px;">'
	);
}

if( mapplet ) {
	document.write(
		'<div id="PollingPlaceSearch">',
			'<div class="PollingPlaceSearchTitle removehelp">',
				'<div style="margin-bottom:4px;">',
					'Find your voting location, registration information and more. ',
					'Enter your <strong>home</strong>&nbsp;address:',
				'</div>',
			'</div>',
			'<!--<div id="PollingPlaceSearchSpinner" class="PollingPlaceSearchSpinner">-->',
			'<!--</div>-->',
			'<div>',
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
				'</form>',
			'</div>',
			'<div class="removehelp">',
				'<div style="margin-top:0.25em;">',
					'Example: ',
					'<a href="#" onclick="return PollingPlaceSearch.sample();">',
						sampleAddr,
					'</a>',
				'</div>',
			'</div>',
		'</div>'
	);
}
else {
	writeScript( 'http://maps.google.com/maps?file=api&amp;v=2&amp;key=' + key );
	if( localsearch ) {
		writeScript( 'http://www.google.com/uds/api?file=uds.js&v=1.0&key=' + key );
		writeScript( 'http://www.google.com/uds/solutions/localsearch/gmlocalsearch.js' );
		document.write(
			'<style type="text/css">',
				'@import url("http://www.google.com/uds/css/gsearch.css");',
				'@import url("http://www.google.com/uds/solutions/localsearch/gmlocalsearch.css");',
		   '</style>'
		);
	}
}

var available = S(
	'<div>',
		'<div>',
			'Voter registration information is available for all states.',
		'</div>',
		'<div style="margin-top:0.5em;">',
			'Voting locations will be available by mid-October.',
		'</div>',
	'</div>'
);

var locationWarning = S(
	'<div style="padding-top:1em; xline-height:1.2em; xcolor:gray; xfont-size:80%;">',
		'<span style="color:red; font-weight:bold;">',
			'Important&nbsp; ',
		'</span>',
		'To ensure that this voting location is correct, please verify it with your local election officials.',
	'</div>'
);

var interpolatedLocationWarning = S(
	'<div style="padding-top:1em; xline-height:1.2em; xcolor:gray; xfont-size:80%;">',
		'<span style="color:red; font-weight:bold;">',
			'Important&nbsp; ',
		'</span>',
		'Verify your voting location with your local election officials. ',
		'This location is an estimate. ',
		'It may be incorrect and may change before election day.',
	'</div>'
);

writeBody = function() {
	document.write(
		'<div id="spinner">',
		'</div>',
		'<div id="wrapper">',
			'<div id="title">',
			'</div>',
			'<div id="mapbox">',
			'</div>',
		'</div>'
	);
};

writeBody();

if( mapplet ) {
	document.write(
		'</div>'
	);
}

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
}

function linkto( addr ) {
	var a = htmlEscape( addr ), u = a;
	if( addr.match(/@/) )
		u = 'mailto:' + u;
	else if( ! addr.match(/^http:\/\//) )
		u = a = 'http://' + a;
	return S( '<a target="_blank" href="', u, '">', a, '</a>' );
}

function expander( link, body ) {
	return S(
		'<div>',
			'<div>',
				'<a href="#" onclick="return expandit(this);">',
					link,
				'</a>',
			'</div>',
			'<div style="display:none; margin:8px;">',
				body,
			'</div>',
		'</div>'
	);
}

expandit = function( node ) {
	 $(node).parent().next().slideDown('slow');
	 return false;
}

var seconds = 1000, minutes = 60 * seconds, hours = 60 * minutes,
	days = 24 * hours, weeks = 7 * days;

var dayNames = [
	'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

var monthNames = [
	'January', 'February', 'March', 'April', 'May', 'June',
	'July', 'August', 'September', 'October', 'November', 'December'
];

function formatDate( date ) {
	date = new Date( date );
	return S(
		dayNames[ date.getDay() ], ', ',
		monthNames[ date.getMonth() ], ' ',
		date.getDate()
	);
}

function electionInfo( a ) {
	a = a || {};
	var state = home.info.state;
	if( ! state  ||  state == stateUS ) return '';
	
	var sameDay = state.gsx$sameday.$t;
	if( sameDay ) sameDay = S(
		'<div style="margin-bottom:0.5em;">',
			state.name, ' residents may register to vote at their polling place on Election Day.',
		'</div>'
	);
	
	var comments = state.gsx$comments.$t;
	if( comments ) comments = S(
		'<div style="margin-bottom:0.5em;">',
			comments,
		'</div>'
	);
	
	//var w = window.open();
	//w.document.write( biglist() );
	//w.document.close();
	
	return S(
		'<div style="margin-bottom:0.5em;">',
			'<div class="heading" style="font-size:110%; margin-bottom:0.75em;">',
				fix('Registration Info'),
			'</div>',
			'<div style="margin-bottom:0.75em;">',
				fix('State: <strong>%S</strong>'),
			'</div>',
			deadline( state, 'gsx$postmark', 'postmarked' )  ||
			deadline( state, 'gsx$receive', '<strong>received</strong> by your election officials' ),
			sameDay,
			comments,
			'<div style="margin-bottom:0.75em;">',
				'Get information about voting in your state:',
			'</div>',
			'<ul style="margin-top:0; margin-bottom:0;">',
				election( 'gsx$areyouregistered', 'Are you registered to vote?' ),
				election( 'gsx$registrationinfo', 'How to register in %S', true ),
				election( 'gsx$absenteeinfo', 'Get an absentee ballot' ),
				election( 'gsx$electionwebsite', '%S election website' ),
			'</ul>',
			'<div style="margin:1.0em 0 0.5em 0;">',
				state.name, ' voter hotline: ',
				'<span style="white-space:nowrap;">',
					state.gsx$hotline.$t,
				'</span>',
			'</div>',
			local(),
		'</div>'
	);
	
	function fix( text, prefix ) {
		return( text
			.replace( '%S', S(
				prefix && state.prefix ? state.prefix  + ' ' : '',
				state.name
			) )
			//.replace( '%C', S(
			//	home.info.county // TODO?
			//) )
		);
	}
	
	//function biglist() {
	//	return S(
	//		'<div style="margin-bottom:0.5em;">',
	//			states.mapjoin( function( state ) {
	//				return S(
	//					'<div>',
	//						'<b>', state.name, '</b>',
	//					'</div>',
	//					deadline( state, 'gsx$postmark', '' )
	//				);
	//			}),
	//		'</div>'
	//	);
	//}
	
	function deadline( state, key, text ) {
		var before = +state[key].$t;
		if( ! before ) return '';
		var date = electionDay - before*days;
		var remain = Math.floor( ( date - today ) / days );
		return S(
			'<div style="margin-bottom:0.75em;',
					remain < 6 ? ' color:red;' : '',
			'">',
				remain < 0 ? '' :
				remain < 1 ? 'Last day to register' :
				' Days left to register: <strong>' + remain + '</strong>',
			'</div>',
			'<div style="margin-bottom:0.75em;">',
				'Registration must be ', text, ' by:<br />',
				'<strong>', formatDate(date), '</strong>',
			'</div>'
		);
	}
	
	function election( key, text, prefix ) {
		var url = state[key].$t;
		return ! url ? '' : S(
			'<li style="margin-bottom:0.5em; margin-left:-1.25em;">',
				'<a target="_blank" href="', url, '" style="font-size:110%;">',
					fix( text, prefix ),
				'</a>',
			'</li>'
		);
	}
	
	function local() {
		var leo = home.leo;
		if( !( leo.title || leo.phone || leo.email  ) ) return '';
		function remove( what ) {
			if( title.indexOf(what) == 0 )
				title = title.slice( what.length + 1 );
		}
		var county = home.info.countyName;
		var title = leo.title;
		remove( county );
		remove( 'County' );
		return S(
			'<div style="padding-top:0.5em;">',
				'<div class="heading" style="padding-bottom:4px">',
					county, ' County ',
					title || ' Voter Info',
				'</div>',
				leo.phone ? S( '<div>', 'Phone: ', leo.phone, '</div>' ) : '',
				leo.email ? S( '<div>', 'Email: ', linkto(leo.email), '</div>' ) : '',
			'</div>'
		);
	}
}

function setVoteHtml() {
	if( ! vote.info ) return;
	//var largeMapLink = mapplet ? '' : S(
	//	'<div style="padding-top:0.5em;">',
	//		'<a target="_blank" href="http://maps.google.com/maps?f=q&hl=en&geocode=&q=', encodeURIComponent( a.address.replace( / /g, '+' ) ), '&ie=UTF8&ll=', latlng, '&z=15&iwloc=addr">',
	//			'Large map and directions &#187;',
	//		'</a>',
	//	'</div>'
	//);
	var extra = S(
		'<div>',
			'<a target="_blank" href="http://maps.google.com/maps?f=d&saddr=', encodeURIComponent(home.info.address), '&daddr=', encodeURIComponent(vote.info.address), '&hl=en&mra=ls&ie=UTF8&iwloc=A&iwstate1=dir">',
				'Get directions',
			'</a>',
			//' - ',
			//'<a xtarget="_blank" href="http://maps.google.com/maps?f=q&hl=en&geocode=&q=polling+places+loc+', encodeURIComponent( a.address.replace( / /g, '+' ) ), '&ie=UTF8&z=15&iwloc=A&iwstate1=stp">',
			//	'Send',
			//'</a>',
		'</div>'
	);
	function location( infowindow ) {
		return formatLocation( vote.info, infowindow ? 'vote-icon-50.png' : 'marker-red.png', 'Your Voting Location', infowindow, extra );
	}
	$title.append( mapplet ? S(
		'<div>',
			electionInfo(),
			'<div style="padding-top:1em">',
			'</div>',
			formatHome(),
			'<div style="padding-top:0.75em">',
			'</div>',
			location(),
			locationWarning,
		'</div>'
	) : S(
		// TODO: refactor
		'<div style="padding:6px 0; margin:4px 0 0 0; border-top:1px solid #AAA; border-bottom:1px solid #AAA;">',
			'<table cellpadding="0" cellspacing="0" style="width:100%;">',
				'<tr valign="top">',
					'<td>',
						formatHome(),
					'</td>',
					'<td>',
						electionInfo(),
					'</td>',
				'</tr>',
			'</table>',
		'</div>'
	) );
	vote.html = S(
		'<div style="font-family:Arial,sans-serif; font-size:10pt;">',
			location( true ),
			locationWarning,
		'</div>'
	);
}

function initMap( a ) {
	if( mapplet ) {
		go();
	}
	else {
		GBrowserIsCompatible() && setTimeout( function() {
			$jsmap = $('#jsmap');
			map = new GMap2( $jsmap[0], {
				mapTypes: [
					G_NORMAL_MAP,
					G_SATELLITE_MAP,
					G_SATELLITE_3D_MAP
				]
			});
			go();
		}, 1 );
	}
	
	function ready() {
		setTimeout( function() {
			var only = ! vote.info;
			setMarker({
				place: home,
				image: baseUrl + 'marker-green.png',
				open: only,
				html: formatHome( true )
			});
			if( vote.info )
				setMarker({
					place: vote,
					html: vote.html,
					open: true
				});
		}, 500 );
	}
	
	function setMarker( a ) {
		var icon = new GIcon( G_DEFAULT_ICON );
		if( a.image ) icon.image = cacheUrl( a.image );
		var marker = a.place.marker =
			new GMarker( a.place.info.latlng, { icon:icon });
		map.addOverlay( marker );
		var options = {
			maxWidth: mapplet ? 325 : Math.min( $jsmap.width() - 150, 325 )
			/*, disableGoogleLinks:true*/
		};
		marker.bindInfoWindow( $(a.html)[0], options );
		if( a.open ) marker.openInfoWindowHtml( a.html, options );
	}
	
	function go() {
		setVoteHtml();
		
		if( ! mapplet ) {
			GEvent.addListener( map, 'load', ready );
			var height = $window.height() - $map.offset().top;
			$map.height( height );
			$jsmap.height( height );
		}
		
		// Initial position with marker centered on home, or halfway between home and voting place
		var hi = home.info, vi = vote.info;
		if( ! hi ) return;
		var latlng = hi.latlng;
		if( vi ) {
			latlng = new GLatLng(
				( hi.lat + vi.lat ) / 2,
				( hi.lng + vi.lng ) / 2
			);
		}
		//var center = latlng;
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
}

function formatLocation( info, icon, title, infowindow, extra ) {
	var size = infowindow ? { width:50, height:50 } : { width:20, height:34 };
	return S(
		'<div style="font-weight:bold; font-size:110%;">',
			title,
		'</div>',
		'<div style="padding-top:0.5em;">',
			'<table cellpadding="0" cellspacing="0">',
				'<tr valign="top">',
					'<td style="width:20px; padding-right:.75em;">',
						'<img src="', cacheUrl( baseUrl + icon ), '" style="width:', size.width, 'px; height:', size.height, 'px;" />',
					'</td>',
					'<td>',
						'<div>',
							info.street,
						'</div>',
						'<div>',
							info.city, ', ', info.state.abbr, ' ', info.zip,
						'</div>',
						extra,
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
		encodeURIComponent(address), '&key=', key
	);
	getJSON( url, callback );
}

function getleo( info, callback ) {
	var url = S( dataUrl, 'leo/', info.state.abbr, '.xml' );
	if( mapplet ) {
		_IG_FetchXmlContent( url, function( xml ) {
			if( typeof xml == 'string' ) {
				callback({});
				return;
			}
			function add( key ) { leo[key] = $.trim( $leo.find(key).text() ); }
			var name = info.countyName.toUpperCase();
			var counties = xml.getElementsByTagName( 'county_name' );
			for( var i = 0, county;  county = counties[i++]; ) {
				if( county.firstChild.nodeValue == name ) {
					var $leo = $(county.parentNode);
					var leo = {};
					add('name'), add('title'), add('phone'), add('fax'), add('email');
					callback( leo );
					return;
				}
			}
			callback({});
		});
	}
	else {
		callback({});
	}
}

function lookup( address, callback ) {
	var url = S(
		'http://pollinglocation.apis.google.com/?q=',
		encodeURIComponent(address)
	);
	getJSON( url, callback );
}

function getJSON( url, callback, cache ) {
	_IG_FetchContent( url, function( text ) {
		var json = eval( '(' + text + ')' );
		callback( json );
	}, {
		refreshInterval: cache || 300
	});
}

function closehelp( callback ) {
	if( ! mapplet )
		return callback();
	var $remove = $('.removehelp');
	if( $.browser.msie  ||  $remove.css('display') == 'none' ) {
		callback();
	}
	else {
		var count = $remove.length;
		$remove.slideUp( 350, function() {
			if( --count == 0 ) callback();
		});
	}
}

function submit( addr ) {
	home = {};
	vote = {};
	map && map.clearOverlays();
	currentAddress = addr;
	$title.empty();
	$map.empty();
	closehelp( function() {
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
						'<div id="radios" style="padding-top:0.5em;">',
							'<strong>Select your address:</strong>',
						'</div>'
					));
					var $radios = $('#radios');
					$radios.append( formatPlaces(places) );
					$('input:radio',$title).click( function() {
						var radio = this;
						spin( true );
						setTimeout( function() {
							function ready() {
								findPrecinct( places[ radio.id.split('-')[1] ] );
							}
							if( $.browser.msie ) ready();
							else $('#radios').slideUp( 350, ready );
						}, 250 );
					});
				}
				else {
					$title.append( sorryHtml() );
				}
			}
		});
	});
}

function formatHome( infowindow ) {
	return S(
		'<div style="font-family:Arial,sans-serif; font-size:10pt;">',
			formatLocation( home.info, infowindow ? 'home-icon-50.png' : 'marker-green.png', 'Your Home', infowindow ),
			//extra ? electionInfo() : '',
		'</div>'
	);
}

function findPrecinct( place ) {
	home.info = mapInfo( place );
	if( ! home.info ) { $title.empty(); sorry(); return; }
	var address = currentAddress = place.address;
	
	getleo( home.info, function( leo ) {
		home.leo = leo;
		lookup( address, function( poll ) {
			if( poll.errorcode != 0 ) sorry();
			else geocode( poll.address[0] || poll.locations[0].address, function( geo ) {  // TEMP FORMAT CHANGE
				var places = geo && geo.Placemark;
				if( ! places  ||  places.length != 1 ) sorry();
				else setMap( vote.info = mapInfo(places[0]) );
			});
		});
	});
}

function sorry() {
	$map.html( sorryHtml() );
	if( mapplet ) setMap( home.info );
	spin( false );
}

function sorryHtml() {
	return S(
		'<div>',
			home.info ? electionInfo() : '',
			'<div style="margin-top:1em;">',
				'<div>',
					'All voting location information will be available by mid-October. ',
					'Until then, please check with your state or local election officials to verify your voting location.',
				'</div>',
			'</div>',
		'</div>'
	);
}

function setMap( a ) {
	if( ! mapplet ) {
		a.width = $map.width();
		$map.height( a.height = $window.height() - $map.offset().top );
		$map.html( formatMap(a) );
	}
	initMap( a );
}

function formatAddress( address ) {
	return htmlEscape( ( address || '' ).replace( /, USA$/, '' ) );
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
							formatAddress(place.address),
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
	if( ! area ) return null;
	var state = stateByAbbr( area.AdministrativeAreaName );
	if( ! state ) return null;
	var sub = area.SubAdministrativeArea || area;
	var locality = sub.Locality;
	if( ! locality ) return null;
	var countyName = sub.SubAdministrativeAreaName || locality.LocalityName;
	var street = locality.Thoroughfare;
	var zip = locality.PostalCode;
	var coord = place.Point.coordinates;
	var lat = coord[1], lng = coord[0];
	return {
		address: formatAddress(place.address),
		lat: lat,
		lng: lng,
		latlng: new GLatLng( lat, lng ),
		street: street && street.ThoroughfareName || '',
		city: locality.LocalityName,
		countyName: countyName,
		state: state,
		zip: zip && zip.PostalCodeNumber || '',
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

var $window = $(window), $title = $('#title'), $map = $('#mapbox'), $spinner = $('#spinner');

//var stateSheet = 'http://spreadsheets.google.com/feeds/list/p9CuB_zeAq5WrrUJlgUtNBg/1/public/values?alt=json';
var stateSheet = dataUrl + 'states.json';
getJSON( stateSheet, function( json ) {
	json.feed.entry.forEach( function( state ) {
		statesByAbbr[ state.abbr = state.gsx$abbr.$t ] = state;
		statesByName[ state.name = state.gsx$name.$t ] = state;
		states.push( state );
	});
	
	zoom = function() {
		function latlng( lat, lng ) { return new GLatLng( +lat.$t, +lng.$t ) }
		var bounds = new GLatLngBounds(
			latlng( state.gsx$south, state.gsx$west ),
			latlng( state.gsx$north, state.gsx$east )
		);
		GAsync( map, 'getBoundsZoomLevel', [ bounds ], function( zoom ) {
			map.setCenter( bounds.getCenter(), zoom );
		});
	}
	
	if( mapplet ) {
		map = new GMap2;
		
		(function() {
			function e( id ) { return document.getElementById('PollingPlaceSearch'+id); }
			var /*spinner = e('Spinner'),*/ /*label = e('Label'),*/ input = e('Input'), button = e('Button');
			button.disabled = false;
			
			window.PollingPlaceSearch = {
				
				focus: function() {
					//label.style.textIndent = '-1000px';
				},
				
				blur: function() {
					//if( input.value === '' )
					//	label.style.textIndent = '0px';
				},
				
				sample: function() {
					input.value = sampleAddr;
					this.submit();
					return false;
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
		(function() {
			var p = new _IG_Prefs();
			function str( key, def ) { return p.getString(key) || ''+def || ''; }
			var addr = p.getString('address');
			submit( addr );
		})();
	}
});

});
