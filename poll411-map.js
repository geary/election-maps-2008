// Copyright 2008 Michael Geary
// http://mg.to/
// Free Beer and Free Speech License (any OSI license)
// http://freebeerfreespeech.org/

//window.console && typeof console.log == 'function' && console.log( location.href );  // TEMP

// Utility functions and jQuery extensions

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

function fetch( url, callback, cache ) {
	if( cache === false ) {
		$.getJSON( url, callback );
	}
	else {
		_IG_FetchContent( url, callback, {
			refreshInterval: opt.nocache ? 1 : opt.cache || 60
		});
	}
}

T = function( name, values, give) {
	name = name.split(':');
	var url = opt.baseUrl + name[0] + '.html', part = name[1];
	if( T.urls[url] )
		return ready();
	
	fetch( url, function( data ) {
		var a = data.replace( /\r\n/g, '\n' ).split( /\n::/g );
		var o = T.urls[url] = {};
		for( var i = 1, n = a.length;  i < n;  ++i ) {
			var s = a[i], k = s.match(/^\S+/), v = s.replace( /^.*\n/, '' );
			o[k] = $.trim(v);
		}
		ready();
	});
	
	function ready() {
		var text = T.urls[url][part].replace(
			/\{\{(\w+)\}\}/g,
			function( match, name ) {
				var value = values[name];
				return value != null ? value : match;
			});
		give && give(text);
		return text;
	}
	
	return null;
};
T.urls = {};

function htmlEscape( str ) {
	var div = document.createElement( 'div' );
	div.appendChild( document.createTextNode( str ) );
	return div.innerHTML;
}

function cacheUrl( url, cache, always ) {
	if( opt.nocache  &&  ! always ) return url + '?q=' + new Date().getTime();
	if( opt.nocache ) cache = 0;
	if( typeof cache != 'number' ) cache = 3600;
	url = _IG_GetCachedUrl( url, { refreshInterval:cache } );
	if( ! url.match(/^http:/) ) url = 'http://' + location.host + url;
	return url;
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

$.extend( $.fn, {
	
	setClass: function( cls, add ) {
		return this[ add ? 'addClass' : 'removeClass' ]( cls );
	},
	
	toggleSlide: function( speed, callback ) {
		return this[ this.is(':hidden') ? 'slideDown' : 'slideUp' ]( speed, callback );
	}
	
});

function analytics( path ) {
	if( path.indexOf( 'http://maps.gmodules.com/ig/ifr' ) == 0 ) return;
	if( path.indexOf( 'http://maps.google.com/maps?f=d' ) == 0 ) path = '/directions';
	path = path.replace( /http:\/\//, 'http/' ).replace( /mailto:/, 'mailto/' );
	path = ( maker ? '/creator/' : params.home ? '/onebox/' : mapplet ? '/mapplet/' : inline ? '/inline/' : '/gadget/' ) + path;
	//console.log( 'analytics', path );
	_IG_Analytics( 'UA-5730550-1', path );
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

// Common initialization

var opt = window.gadget ? gadget : window.mapplet ? mapplet : {};

var prefs = new _IG_Prefs();
var pref = {
	gadgetType: 'iframe',
	example: '1600 Pennsylvania Ave 20006',
	address: '',
	fontFamily: 'Arial,sans-serif',
	fontSize: '10',
	fontUnits: 'pt',
	scoop: '',
	scoop1: ''
};
for( var name in pref ) pref[name] = prefs.getString(name) || pref[name];
if( pref.scoop1 ) pref.scoop = pref.scoop1;
pref.ready = prefs.getBool('submit');

var maker = decodeURIComponent(location.href).indexOf('source=http://www.gmodules.com/ig/creator?') > -1;

var fontStyle = S( 'font-family:', pref.fontFamily, '; font-size:', pref.fontSize, pref.fontUnits, '; ' );

var baseUrl = opt.baseUrl;
var dataUrl = opt.dataUrl || baseUrl;

var width = $(window).width(), height = $(window).height();

var variables = {
	width: width - 14,
	height: height - 80,
	example: pref.example,
	fontFamily: pref.fontFamily.replace( "'", '"' ),
	fontSize: pref.fontSize,
	fontUnits: pref.fontUnits,
	gadget: opt.gadgetUrl
};

// Date and time

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

var electionDay = new Date( 2008, 10, 4 );

var today = new Date;
today.setHours( 0, 0, 0, 0 );

////  Date tester
//if( 0 ) {
//	today = new Date( 2008,  9, 6 );
//	document.write(
//		'<div style="font-weight:bold;">',
//			'Test date: ', formatDate( today ),
//		'</div>'
//	);
//}
////

// State data

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

function indexSpecialStates() {
	var special = {
		'N Carolina': 'North Carolina',
		'N Dakota': 'North Dakota',
		'S Carolina': 'South Carolina',
		'S Dakota': 'South Dakota',
		'W Virginia': 'West Virginia'
	};
	for( var abbr in special )
		statesByName[abbr] = statesByName[ special[abbr] ];
}

var mapplet = window.mapplet;
var inline = ! mapplet  &&  pref.gadgetType == 'inline';
var iframe = ! mapplet  &&  ! inline;

var map, $jsmap, currentAddress;
var home, vote, scoop, interpolated;

var key = {
	'gmodules.com': 'ABQIAAAAL7MXzZBubnPtVtBszDCxeRTZqGWfQErE9pT-IucjscazSdFnjBSzjqfxm1CQj7RDgG-OoyNfebJK0w',
	'maps.gmodules.com': 'ABQIAAAAL7MXzZBubnPtVtBszDCxeRTqV_PyyxRizIwUkTfU6T-V7M7btRRpOM29SpcTDh2dojFpfRwpoTTMWw',
	'www.gmodules.com': 'ABQIAAAAL7MXzZBubnPtVtBszDCxeRSf0RMTBV-KKR6hvCL9Kx2eVMqFbxQJkQOf-iqm2g6XkyYWJQsN9S97qg',
	'': ''
}[location.host];

// HTML snippets

function infoLinks() {
	var info = home && home.info;
	if( ! info ) return '';
	return S(
		'<div style="', fontStyle, '">',
			'<div style="margin-top:0.5em;">',
				'<a href="',
					"mailto:elections-data@google.com?subject=Voter Info Error Report&body=Thank you for reporting an error in Google's voter information for ",
					info.street ? info.street.replace( /^\s*\d+ +/, '' ) + ', ' : '',
					formatInfoLocality(info).replace( /"/g, ' ' ),
					'. Please describe the error below and send us this email so we can correct the problem. Thanks!',
				'">',
					'Report an error',
				'</a>',
			'</div>',
			'<div style="margin-top:1em; border-top:1px solid #BBB; padding-top:1em;">',
				'Full election coverage:<br />',
				'<a target="_blank" href="http://www.google.com/2008election">',
					'Google 2008 Election Site',
				'</a>',
			'</div>',
			'<div style="margin-top:1em;">',
				'More election maps:<br />',
				'<a target="_blank" href="http://maps.google.com/elections">',
					'Google Elections Map Gallery',
				'</a>',
			'</div>',
			'<div style="margin:1em 0 1em 0;">',
				'Help others find their voter information:<br />',
				'<a target="_blank" href="http://gmodules.com/ig/creator?synd=open&url=http://election-maps-2008.googlecode.com/svn/trunk/poll411-gadget.xml">',
					'Get this gadget for your website',
				'</a>',
			'</div>',
		'</div>'
	);
}

var fullvips = 'state and local election officials from Iowa, Kansas, Maryland, Minnesota, Missouri, Montana, North Carolina, North Dakota, Ohio, and Los Angeles County,';

var attribution = S(
	'<div style="', fontStyle, ' color:#333;">',
		'<div style="font-size:85%; margin-top:0.5em; border-top:1px solid #BBB; padding-top:1em;">',
			'Developed with ',
			'<span id="vips" style="font-size:100%;">',
				'<a style="font-size:100%;" href="#" onclick="$(\'#vips\').html(fullvips); return false;">',
					'state and local election officials',
				'</a>',
			'</span>',
			' and the ',
			'<a style="font-size:100%;" target="_blank" href="http://votinginfoproject.org/">',
				'Voting Information Project',
			'</a>',
			'.',
		'</div>',
		'<div style="font-size:85%; margin-top:0.75em;">',
			'In conjunction with the ',
			'<a style="font-size:100%;" target="_blank" href="http://www.lwv.org/">',
				'League of Women Voters',
			'</a>',
			'.',
		'</div>',
	'</div>'
);

function formatInfoLocality( info ) {
	var locality = info.city ? info.city : info.county ? info.county + ' County' : '';
	return S(
		locality ? locality  + ', ' + info.state.abbr : info.address.length > 2 ? info.address : info.state.name,
		info.zip ? ' ' + info.zip : ''
	);
}

// Maker inline initialization

function makerWrite() {
	if( msie ) $('body')[0].scroll = 'no';
	$('body').css({ margin:0, padding:0 });
	
	var overlays = pref.gadgetType == 'iframe' ? '' : S(
		'<div id="getcode" class="popupOuter">',
			'<div class="popupInner" style="width:225px;">',
				'<div style="text-align:center; margin-bottom:10px;">',
					'<button type="button" id="btnGetCode" style="font-size:24px;">',
						'Get the Code',
					'</button>',
				'</div>',
				'<div style="font-size:14px;">',
					'<div style="margin-bottom:8px;">',
						'Click this button for an <strong>inline</strong> gadget using HTML and JavaScript. ',
					'</div>',
					'<div style="margin-bottom:8px;">',
						'The inline gadget initially displays only the search input form, without taking extra space on your page. When you click the <strong>Search</strong> button, it expands to its full height.',
					'</div>',
					'<div style="margin-bottom:8px;">',
						'Not all websites support the inline gadget. ',
						'For a simpler gadget, change the <strong>Gadget Type</strong> below to Standard Gadget.',
					'</div>',
				'</div>',
			'</div>',
		'</div>',
		'<div id="havecode" class="popupOuter" style="width:95%; height:90%;">',
			'<div class="popupInner">',
				'<div>',
					'<div style="font-size:16px; margin-bottom:6px;">',
						'<strong>Copy and paste this HTML to include the gadget on your website.</strong><br />',
					'</div>',
					'<div style="font-size:15px; margin-bottom:8px;">',
						'Or click <strong>Get the Code</strong> below for a simpler fixed-height <strong><code>&lt;iframe&gt;</code></strong> gadget.',
					'</div>',
					'<div style="font-size:12px;">',
						'<form id="codeform" name="codeform" style="margin:0; padding:0;">',
							'<textarea id="codearea" name="codearea" style="width:100%; height:80%; font-family: Consolas,Courier New,Courier,monospace;" value="">',
							'</textarea>',
						'</form>',
					'</div>',
				'</div>',
			'</div>',
		'</div>'
	);
	
	document.write(
		'<style type="text/css">',
			'.popupOuter { z-index:1; position:absolute; background-color:white; display:none; }',
			'.popupInner { background-color:#E5ECF9; border:1px solid #3366CC; padding:8px; margin:4px; }',
		'</style>',
		'<div id="outerlimits">',
		'</div>',
		overlays
	);
	
	var $getcode = $('#getcode'), $havecode = $('#havecode'), $codearea = $('#codearea');
	$codearea.height( height - 150 );
	center( $getcode );
	center( $havecode );
	
	function center( $item ) {
		$item.css({
			left: ( width - $item.width() ) / 2,
			top: ( height - $item.height() ) / 2
		});
	}
	
	T( 'poll411-maker:style', variables, function( head ) {
		$('head').append( $(head) );
		var body =
			T( 'poll411-maker:html', variables ) + '\n\n' +
			T( 'poll411-maker:script', variables );
		$('#outerlimits').html( body ).height( height );
		$getcode.show();
		$('#btnGetCode').click( function() {
			$codearea.val( head + '\n\n' + body + '\n' );
			$havecode.show();
			document.codeform.codearea.focus()
			document.codeform.codearea.select()
		});
	});
}

// Gadget inline initialization

function gadgetWrite() {
	
	document.write(
		'<style type="text/css">',
			'body.gadget { margin:0; padding:0; }',
			'#wrapper, #wrapper * { ', fontStyle, ' }',
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
				'body { height:', height, 'px; }',
				'#spinner { z-index: 1; position:absolute; width:100%; height:100%; background-image:url(', cacheUrl( baseUrl + 'spinner.gif' ), '); background-position:center; background-repeat:no-repeat; opacity:0.30; -moz-opacity:0.30;', pref.ready ? '' : 'display:none;', '}',
				'#spinner { filter:alpha(opacity=30); }',
				'#title { width:100%; }',
				'#mapbox { width:100%; }',
			'</style>'
		);
	}
	
	if( mapplet ) {
		document.write(
			'<div id="outerlimits" style="margin-right:8px;">',
				'<div id="PollingPlaceSearch">',
					'<div class="PollingPlaceSearchTitle removehelp">',
						'<div style="margin-bottom:4px;">',
							'Find your voting location and more.<br />',
							'Enter the <strong>home</strong> address where you are registered to vote:',
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
								htmlEscape( pref.example ),
							'</a>',
						'</div>',
					'</div>',
				'</div>',
				'<div id="spinner">',
				'</div>',
				'<div id="wrapper">',
					'<div id="title">',
						attribution,
					'</div>',
					'<div id="mapbox">',
					'</div>',
				'</div>',
			'</div>'
		);
	}
	else {
		writeScript( 'http://maps.google.com/maps?file=api&amp;v=2&amp;key=' + key );
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
	}
}

// Document ready code

function makerReady() {
	_IG_Analytics( 'UA-5730550-1', '/creator' );
}

function gadgetReady() {
	
	function locationWarning() {
		var registered = home.info.state.abbr == 'ND' ? '' : S(
			'You must be registered in order to vote. '
		);
		var warning = interpolated ? S(
			registered,
			'Verify your voting location with your local election officials. ',
			'This voting location is for the November 4 election only (not for early voting), and it is an <strong>estimate</strong> based on nearby addresses. ',
			'It may be incorrect and may change before election day.'
		) : S(
			registered,
			'This voting location is for the November 4 election only (not for early voting), and it is only for voters registered at the home address entered. ',
			'Please verify this voting location with your local election officials to ensure that it is correct.'
		);
		return S(
			'<div style="padding-top:1em;">',
				'<span style="font-weight:bold;">',
					'Important: ',
				'</span>',
				warning,
			'</div>'
		);
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
	
	function electionInfo( a ) {
		a = a || {};
		var state = home.info.state;
		if( ! state  ||  state == stateUS ) return '';
		
		var sameDay = state.gsx$sameday.$t != 'TRUE' ? '' : S(
			'<div style="margin-bottom:0.5em;">',
				state.name, ' residents may register to vote at their polling place on Election Day:<br />',
				'Tuesday, November 4',
			'</div>'
		);
		
		var comments = state.gsx$comments.$t;
		if( comments ) comments = S(
			'<div style="margin-bottom:0.5em;">',
				comments,
			'</div>'
		);
		
		var deadlineText = {
			mail: {
				type: 'registration',
				left: 'Days left to register by mail',
				last: 'Today is the last day to register by mail',
				mustbe: 'Registration must be postmarked by:<br />'
			},
			receive: {
				type: 'registration',
				left: 'Days left for registration to be received by your election officials',
				last: 'Today is the last day for registration to be received by your election officials',
				mustbe: 'Registration must be received by:<br />'
			},
			inperson: {
				type: 'registration',
				left: 'Days left to register in person',
				last: 'Today is the last day to register in person',
				mustbe: 'In person registration allowed through:<br />'
			},
			armail: {
				type: 'absentee ballot request',
				left: 'Days left to request an absentee ballot by mail',
				last: 'Today is the last day to request an absentee ballot by mail',
				mustbe: 'Absentee ballot requests must be postmarked by '
			},
			arreceive: {
				type: 'absentee ballot request',
				left: 'Days left for absentee ballot request to be received by your election officials',
				last: 'Today is the last day for an absentee ballot request to be received by your election officials',
				mustbe: 'Absentee ballot requests must be received by '
			},
			avmail: {
				type: 'completed absentee ballot',
				left: 'Days left to mail your completed absentee ballot',
				last: 'Today is the last day to mail your completed absentee ballot',
				mustbe: 'Completed absentee ballots must be postmarked by '
			},
			avreceive: {
				type: 'completed absentee ballot',
				left: 'Days left for a completed absentee ballot to be received by your election officials',
				last: 'Today is the last day for a completed absentee ballot to be received by your election officials',
				mustbe: 'Completed absentee ballots must be received by '
			}
		};
		
		//var w = window.open();
		//w.document.write( biglist() );
		//w.document.close();
		
		var absenteeLinkTitle = {
			'Early': 'Absentee ballot and early voting information',
			'Mail': 'Vote by mail information'
		}[state.gsx$absentee.$t] || 'Get an absentee ballot';
		
		var absentee = S(
			'<div style="margin-bottom:0.5em;">',
				fix( state.gsx$absenteeautomatic.$t == 'TRUE' ?
					'Any %S voter may vote by mail.' :
					'Some %S voters may qualify to vote by mail.'
				),
			'</div>',
			'<ul style="margin-top:0; margin-bottom:0;">',
				election( 'gsx$absenteeinfo', absenteeLinkTitle ),
			'</ul>',
			deadline( state, 'gsx$absrequestpostmark', 'armail' ),
			deadline( state, 'gsx$absrequestreceive', 'arreceive' ),
			deadline( state, 'gsx$absvotepostmark', 'avmail' ),
			deadline( state, 'gsx$absvotereceive', 'avreceive' )
		);
		var deadlines = (
			deadline( state, 'gsx$postmark', 'mail' )  || deadline( state, 'gsx$receive', 'receive' )
		) + deadline( state, 'gsx$inperson', 'inperson' );
		//if( ! deadlines  &&  state.abbr != 'ND'  &&  state.gsx$sameday.$t != 'TRUE' )
		//	deadlines = S(
		//		'<div style="margin-bottom:0.75em;">',
		//			'The deadline to mail your registration for the November 4, 2008 general election has passed. ',
		//			//state.gsx$regcomments.$t || '',
		//		'</div>'
		//	);
		return S(
			'<div style="margin-bottom:0.5em;">',
				'<div class="heading" style="font-size:110%; margin-bottom:0.75em;">',
					'Vote by Mail',
				'</div>',
				'<div style="margin-bottom:1em;">',
					absentee,
				'</div>',
				'<div class="heading" style="font-size:110%; margin-bottom:0.75em;">',
					'Voter Registration',
				'</div>',
				'<div style="margin-bottom:0.75em;">',
					fix('State: %S'),
				'</div>',
				deadlines || '',
				sameDay,
				comments,
				mapplet ? S(
					'<div style="margin-bottom:0.75em;">',
						'Get information about voting in your state:',
					'</div>'
				) : '',
				'<ul style="margin-top:0; margin-bottom:0;">',
					election( 'gsx$areyouregistered', 'Are you registered to vote?' ),
					election( 'gsx$registrationinfo', state.abbr == 'ND' ? '%S voter qualifications' : 'How to register in %S', true ),
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
		
		function deadline( state, key, type ) {
			var before = +state[key].$t;
			if( before == '' ) return '';
			var dt = deadlineText[type];
			var date = electionDay - before*days;
			var remain = Math.floor( ( date - today ) / days );
			if( remain < 0 ) return '';
			var sunday = type == 'mail'  &&  new Date(date).getDay() == 0;
			
			var sundayNote =
				! sunday ? '' :
				remain > 1 ?
					'Note: Most post offices are closed Sunday. Mail your ' + dt.type + ' by Saturday to be sure of a timely postmark.' :
				remain == 1 ?
					'Note: Most post offices are closed Sunday. Mail your ' + dt.type + ' today to be sure of a timely postmark.' :
				remain == 0 ?
					"Note: Most post offices are closed today. You can still mail your ' + dt.type + ' if your post office is open and has a collection today." :
					'';
			
			sundayNote = sundayNote && S(
				'<div style="margin-bottom:0.75em;">',
					sundayNote,
				'</div>'
			);
			
			var last = remain < 1; //  ||  sunday && remain < 2;
			return S(
				'<div style="margin-bottom:0.75em;">',
					last ? dt.last : S( dt.left, ': ', remain ),
				'</div>',
				last ? '' : S(
					'<div style="margin-bottom:0.75em;">',
						dt.mustbe, formatDate(date),
					'</div>'
				),
				sundayNote
			);
		}
		
		function election( key, text, prefix ) {
			var url = state[key].$t;
			return ! url ? '' : S(
				'<li style="margin-bottom:0.5em; margin-left:-1.25em;">',
					'<a target="_blank" href="', url, '">',
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
			var county = home.info.county;
			var title = leo.title;
			return S(
				'<div style="padding-top:0.5em;">',
					'<div class="heading" style="padding-bottom:4px">',
						'Local Voter Info',
					'</div>',
					'<div>',
						title,
					'</div>',
					leo.phone ? S( '<div>', 'Phone: ', leo.phone, '</div>' ) : '',
					leo.email ? S( '<div>', 'Email: ', linkto(leo.email), '</div>' ) : '',
				'</div>'
			);
		}
	}
	
	function directionsLink( from, to ) {
		return S(
			'<div>',
				'<a target="_blank" href="http://maps.google.com/maps?f=d&saddr=', encodeURIComponent(from.info.address), '&daddr=', encodeURIComponent(to.info.address), '&hl=en&mra=ls&ie=UTF8&iwloc=A&iwstate1=dir">',
					'Get directions',
				'</a>',
			'</div>'
		);
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
		var extra = home.info.latlng && vote.info.latlng ? directionsLink( home, vote ) : '';
		function location( infowindow ) {
			return formatLocation( vote.info, infowindow || ! mapplet ? 'vote-icon-50.png' : 'marker-red.png', 'Voting Location', infowindow, extra );
		}
		if( mapplet ) {
			$title.append( S(
				log.print(),
				'<div>',
					formatHome(),
					'<div style="padding-top:0.75em">',
					'</div>',
					location(),
					locationWarning(),
					'<div style="padding-top:1em">',
					'</div>',
					electionInfo(),
					infoLinks(),
					attribution,
				'</div>'
			) );
			vote.html = S(
				'<div style="', fontStyle, '">',
					location( true ),
					locationWarning(),
				'</div>'
			);
			_IG_AdjustIFrameHeight();
		}
		else {
			$title.empty();
			vote.html = infoWrap( S(
				log.print(),
				homeAndVote(),
				'<div style="padding-top:1em">',
				'</div>',
				electionInfo(),
				infoLinks(),
				attribution
			) );
		}
		
		function homeAndVote() {
			return vote.info.latlng ? S(
				location(),
				locationWarning(),
				'<div style="padding-top:0.75em">',
				'</div>',
				formatHome()
			) : S(
				formatHome(),
				'<div style="padding-top:0.75em">',
				'</div>',
				location(),
				locationWarning()
			);
		}
	}
	
	function infoWrap( html ) {
		return S(
			'<div style="', fontStyle, ' margin-top:12px; padding-right:4px; height:', $map.height() - 200, 'px; overflow:auto;">',
				html,
			'</div>'
		)
	}
	
	function initMap( a ) {
		if( mapplet ) {
			go();
		}
		else {
			GBrowserIsCompatible() && setTimeout( function() {
				$jsmap = $('#jsmap');
				map = new GMap2( $jsmap[0], {
					//googleBarOptions: { showOnLoad: true },
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
				var only = ! vote.info  ||  ! vote.info.latlng;
				setMarker({
					place: home,
					image: baseUrl + 'marker-green.png',
					open: ! scoop && only,
					html: mapplet || ! only ? formatHome(true) : vote.html || infoWrap( sorryHtml() )
				});
				if( vote.info  &&  vote.info.latlng )
					setMarker({
						place: vote,
						html: vote.html,
						open: ! scoop
					});
				if( scoop ) {
					var icon = new GIcon( G_DEFAULT_ICON );
					icon.image = cacheUrl( baseUrl + 'scoop.png' );
					icon.shadow = null;
					icon.iconSize = new GSize( 48, 48 );
					icon.shadowSize = null;
					icon.iconAnchor = new GPoint( 15, 47 );
					icon.infoWindowAnchor = new GPoint( 27, 0 );
					setMarker({
						place: scoop,
						icon: icon,
						html: scoop.html,
						open: false
					});
				}
			}, 500 );
		}
		
		function setMarker( a ) {
			var icon = a.icon || new GIcon( G_DEFAULT_ICON );
			if( a.image ) icon.image = cacheUrl( a.image );
			var marker = a.place.marker =
				new GMarker( a.place.info.latlng, { icon:icon });
			map.addOverlay( marker );
			var options = {
				maxWidth: mapplet ? 350 : Math.min( $jsmap.width() - 100, 350 )
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
			
			var hi = home.info, vi = vote.info;
			if( ! hi ) return;
			if( scoop ) {
				si = scoop.info;
				var bounds = new GLatLngBounds();
				bounds.extend( si.latlng );
				bounds.extend( hi.latlng );
				if( vi ) bounds.extend( vi.latlng );
				map.setCenter( bounds.getCenter(), map.getBoundsZoomLevel(bounds) );
			}
			else {
				// Initial position with marker centered on home, or halfway between home and voting place
				var latlng = hi.latlng;
				if( vi  &&  vi.latlng ) {
					latlng = new GLatLng(
						( hi.lat + vi.lat ) / 2,
						( hi.lng + vi.lng ) / 2
					);
				}
				//var center = latlng;
				//var width = $jsmap.width(), height = $jsmap.height();
				map.setCenter( latlng, a.zoom );
			}
			
			if( mapplet ) {
				GEvent.addListener( map, 'click', function( overlay, point ) {
					if( !( overlay || point ) )
						analytics( 'directions' );
				});
			}
			else {
				// Move map down a bit
				//var point = map.fromLatLngToDivPixel( latlng );
				//point = new GPoint(
				//	point.x /*- width * .075*/,
				//	point.y - height * .275
				//);
				//map.setCenter( map.fromDivPixelToLatLng(point), a.zoom );
				map.addControl( new GSmallMapControl );
				map.addControl( new GMapTypeControl );
				map.enableGoogleBar();
			}
			if( mapplet )
				ready();
			spin( false );
		}
	}
	
	function formatLocation( info, icon, title, infowindow, extra ) {
		var size = infowindow || ! mapplet ? { width:50, height:50 } : { width:20, height:34 };
		var locality = info.city ? info.city : info.county ? info.county + ' County' : '';
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
								info.location ? '<strong>' + htmlEscape(info.location) + '</strong><br />' : '',
								info.description ? '<span style="font-size:90%">' + htmlEscape(info.description) + '</span><br />' : '',
								'<div style="margin-top:', info.location || info.description ? '0.25' : '0', 'em;">',
									info.street,
								'</div>',
							'</div>',
							'<div>',
								locality ? locality  + ', ' + info.state.abbr : info.address.length > 2 ? info.address : info.state.name,
								info.zip ? ' ' + info.zip : '',
							'</div>',
							'<div>',
								info.directions || '',
							'</div>',
							'<div>',
								info.hours ? 'Hours: ' + info.hours : '',
							'</div>',
							extra,
						'</td>',
					'</tr>',
				'</table>',
				info.latlng ? '' : S(
					'<div style="padding-top: 0.5em">',
						'We were unable to locate this voting place on the map. ',
						'Please check with your election officals for the exact address.',
					'</div>'
				),
			'</div>'
		);
	}
	
	function formatInfoAddress( info ) {
		return S(
			'<div>',
				info.street,
			'</div>',
			'<div>',
				formatInfoLocality( info ),
			'</div>'
		);
	}
	
	function spin( yes ) {
		//console.log( 'spin', yes );
		$('#spinner').css({ visibility: yes ? 'visible' : 'hidden' });
	}
	
	function geocode( address, callback ) {
		var url = S(
			'http://maps.google.com/maps/geo?output=json&callback=?&oe=utf-8&gl=us&q=',
			encodeURIComponent(address), '&key=', key
		);
		getJSON( url, callback, false );
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
				var name = info.county.toUpperCase();
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
			}, 300 );
		}
		else {
			callback({});
		}
	}
	
	function lookup( address, callback ) {
		if( address == '1600 Pennsylvania Ave NW, Washington, DC 20006, USA' ) {
			callback({
				errorcode: 0,
				locations: [{
					address: '600 22nd St NW, Washington, DC 20037, USA',
					location: 'George Washington University',
					description: "The Smith Center-80's Club Room"
				}]
			});
			return;
		}
		var url = S(
			'http://pollinglocation.apis.google.com/?q=',
			encodeURIComponent(address)
		);
		getJSON( url, callback );
		//callback({ errorcode: -1 });  // temp disable
		//callback({ errorcode:0, address:[ '600 22nd St NW, Washington, DC 20037' ] });
	}
	
	function scooper( lat, lng, callback ) {
		if( pref.scoop ) {
			var url = S( 'http://s.mg.to/elections/scoop.py/find?lat=', lat, '&lng=', lng );
			getJSON( url, callback );
		}
		else {
			callback();
		}
	}
	
	function getJSON( url, callback, cache ) {
		fetch( url, function( text ) {
			var json = typeof text == 'object' ? text : eval( '(' + text + ')' );
			callback( json );
		}, cache );
	}
	
	function closehelp( callback ) {
		if( ! mapplet )
			return callback();
		
		var $remove = $('.removehelp');
		if( $remove.is(':hidden') )
			return callback();
		
		if( $.browser.msie ) {
			$remove.hide();
			return callback();
		}
		
		var count = $remove.length;
		$remove.slideUp( 350, function() {
			if( --count == 0 ) callback();
		});
	}
	
	function setGadgetPoll411() {
		var input = $('#Poll411Input')[0];
	    input.value = pref.example;
		Poll411 = {
			
			focus: function() {
				if( input.value == pref.example ) {
					input.className = '';
					input.value = '';
				}
			},
			
			blur: function() {
				if( input.value ==  ''  ||  input.value == pref.example ) {
					input.className = 'example';
					input.value = pref.example;
				}
			},
			
			submit: function() {
				$spinner.show();
				submit( input.value );
				return false;
			}
		};
	}
	
	function submit( addr ) {
		analytics( 'lookup' );
		addr = $.trim( addr );
		log();
		log.yes = /^!!/.test( addr );
		if( log.yes ) addr = $.trim( addr.replace( /^!!/, '' ) );
		log( 'Input address:', addr );
		var state = statesByAbbr[ addr.toUpperCase() ];
		if( state ) addr = state.name;
        if( addr == pref.example ) addr = addr.replace( /^.*: /, '' );
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
				log( 'Number of matches: ' + n );
				if( ! n ) {
					spin( false );
					$title.html( S(
						log.print(),
						'We did not find that address. Please check the spelling and try again. Be sure to include your zip code or city and state.'
					) );
				}
				else if( n == 1 ) {
					findPrecinct( places[0] );
				}
				else {
					if( places ) {
						$title.append( S(
							'<div id="radios">',
								'<div id="radios" style="padding-top:0.5em;">',
									'<strong>Select your address:</strong>',
								'</div>',
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
								if( $.browser.msie ) {
									$radios.hide();
									ready();
								}
								else {
									$radios.slideUp( 350, ready );
								}
							}, 250 );
						});
					}
					else {
						sorry();
					}
				}
			});
		});
	}
	
	function formatHome( infowindow ) {
		return S(
			'<div style="', fontStyle, '">',
				formatLocation( home.info, infowindow || ! mapplet ? 'home-icon-50.png' : 'marker-green.png', 'Your ' + home.info.kind, infowindow ),
				//extra ? electionInfo() : '',
			'</div>'
		);
	}
	
	function findPrecinct( place ) {
		log( 'Getting home map info' );
		home.info = mapInfo( place );
		if( ! home.info ) { $title.empty(); sorry(); return; }
		currentAddress = place.address;
		var location;
		
		getleo( home.info, function( leo ) {
			home.leo = leo;
			lookup( currentAddress, function( poll ) {
				log( 'Polling errorcode: ' + poll.errorcode + {
					0: ' (exact)',
					3: ' (interpolated)'
				}[poll.errorcode] || '');
				if( poll.errorcode != 0  && poll.errorcode != 3 ) {
					sorry();
				}
				else {
					interpolated = ( poll.errorcode == 3 );
					location = poll.locations[0];
					var address = location.address;
					log( 'Polling address:', address );
					if( ! address ) {
						if( location.location ) setNoGeo( location );
						else sorry();
						return;
					}
					var ok = address.match( /(,| +)\d\d\d\d\d(-\d\d\d\d)? *$/i );
					if( ! ok ) {
						var match = address.match( /(,| +) *([a-z][a-z])(,| *)$/i );
						ok = match && statesByAbbr[ match[2].toUpperCase() ];
					}
					if( ! ok ) {
						address = address
							.replace( /(,| +) *\w\w *$/, ' ' )
							.replace( / *, */, ' ' )
							+ ', ' + home.info.city + ', ' + home.info.state.abbr;
					}
					log( 'Modified address:', address );
					geocode( address, function( geo ) {
						var places = geo && geo.Placemark;
						set( places, location );
					});
				}
			});
		});
		
		function set( places, location ) {
			if( places && places.length == 1 ) {
				try {
					var abbr = places[0].AddressDetails.Country.AdministrativeArea.AdministrativeAreaName;
					var st = statesByName[abbr] || statesByAbbr[ abbr.toUpperCase() ];
					log( 'Polling state: ' + st.name );
					if( st != home.info.state ) {
						log( 'Polling place geocoded to wrong state' );
						setNoGeo( location );
						return;
					}
				}
				catch( e ) {
					log( 'Error getting polling state' );
				}
				log( 'Getting polling place map info' );
				setMap( vote.info = mapInfo( places[0], location ) );
				return;
			}
			setNoGeo( location );
		}
		
		function setNoGeo( location ) {
			vote.info = {
				address: ( location.address || '' ).replace( / *, */g, '<br />' ),
				location: location.location,
				description: location.description,
				directions: location.directions,
				hours: location.hours,
				_:''
			};
			setVoteHtml();
			setMap( home.info );
		}
	}
	
	function sorry() {
		if( mapplet ) $title.append( log.print() + sorryHtml() );
		setMap( home.info );
		spin( false );
	}
	
	function sorryHtml() {
		return S(
			'<div>',
				formatHome(),
				'<div style="padding-top:0.75em">',
				'</div>',
				'<div style="margin-bottom:1em;">',
					'We are unable to provide voting location information for your address at this time. ',
					'Please check with your state or local election officials to find your voting location.',
				'</div>',
				home.info ? electionInfo() : '',
				infoLinks(),
				attribution,
			'</div>'
		);
	}
	
	function setMap( a ) {
		if( ! a ) return;
		if( ! mapplet ) {
			a.width = $map.width();
			$map.height( a.height = $window.height() - $map.offset().top );
			$map.html( formatMap(a) );
		}
		scooper( a.lat, a.lng, function( shop ) {
			if( shop ) {
				scoop = {
					info: {
						address: shop.address,
						lat: shop.lat,
						lng: shop.lng,
						latlng: new GLatLng( shop.lat, shop.lng )
					}
				}
				scoop.html = S(
					'<div style="', fontStyle, '">',
						'<div style="font-size:125%; font-weight:bold;">',
							'Ben & Jerry&#146;s',
						'</div>',
						'<div>',
							shop.address.replace( /,/, '<br />' ),
						'</div>',
						directionsLink( vote && vote.info ? vote : home, scoop ),
						'<div style="margin-top:0.5em;">',
							'<a target="_blank" href="http://www.benandjerrys.com/">',
								'www.benandjerrys.com',
							'</a>',
						'</div>',
					'</div>'
				);
			}
			initMap( a );
		});
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
	
	var Accuracy = {
		country:1, state:2, county:3, city:4,
		zip:5, street:6, intersection:7, address:8, premise:9
	};
	var Kind = [ '', 'Country', 'State', 'County', 'City', 'Neighborhood', 'Neighborhood', 'Neighborhood', 'Home', 'Home' ];
	var Zoom = [ 4, 5, 6, 10, 11, 12, 13, 14, 15, 15 ];
	
	function mapInfo( place, extra ) {
		extra = extra || {};
		var details = place.AddressDetails;
		var accuracy = Math.min( details.Accuracy, Accuracy.address );
		if( accuracy < Accuracy.state ) {
			log( 'Not accurate enough' );
			return null;
		}
		var country = details.Country;
		if( ! country ) {
			log( 'No country' );
			return null;
		}
		var area = country.AdministrativeArea;
		if( ! area ) {
			log( 'No AdministrativeArea' );
			return null;
		}
		var areaname = area.AdministrativeAreaName;
		var state = statesByName[areaname] || statesByAbbr[ areaname.toUpperCase() ] || statesByName[ (place.address||'').replace( /, USA$/, '' ) ];
		if( ! state ) {
			log( 'No state' );
			return null;
		}
		var sub = area.SubAdministrativeArea || area, locality = sub.Locality;
		if( locality ) {
			log( 'Got Locality' );
			var county = sub.SubAdministrativeAreaName || locality.LocalityName;
			var city = locality.LocalityName;
			var street = locality.Thoroughfare;
			var zip = locality.PostalCode;
		}
		else if( area.AddressLine ) {
			log( 'Got AddressLine' );
			var addr = area.AddressLine[0] || '';
			if( addr.match( / County$/ ) )
				county = addr.replace( / County$/, '' );
			else
				city = addr;
		}
		var coord = place.Point.coordinates;
		var lat = coord[1], lng = coord[0];
		var formatted = formatAddress( place.address );
		log( 'Formatted address:', formatted );
		return {
			address: formatted,
			location: extra.location,
			description: extra.description,
			directions: extra.directions,
			hours: extra.hours,
			lat: lat,
			lng: lng,
			latlng: new GLatLng( lat, lng ),
			street: street && street.ThoroughfareName || '',
			city: city || '',
			county: county || '',
			state: state,
			zip: zip && zip.PostalCodeNumber || '',
			zoom: Zoom[accuracy],
			accuracy: accuracy,
			kind: Kind[accuracy],
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
	
	T( 'poll411-maker:style', variables, function( head ) {
		if( ! mapplet  &&  ! pref.ready ) {
			$('head').append( $(head) );
			var part = pref.scoop1 ? 'scoop1' : pref.scoop ? 'scoop' : 'html';
			$('body').prepend( T( 'poll411-maker:' + part, variables ) );
			
			setGadgetPoll411();
		}
		
		var stateSheet = 'http://spreadsheets.google.com/feeds/list/p9CuB_zeAq5X-twnx_mdbKg/2/public/values?alt=json';
		
		getJSON( stateSheet, function( json ) {
			json.feed.entry.forEach( function( state ) {
				statesByAbbr[ state.abbr = state.gsx$abbr.$t ] = state;
				statesByName[ state.name = state.gsx$name.$t ] = state;
				states.push( state );
			});
			
			indexSpecialStates();
			
			zoom = function( state ) {
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
				if( params.state )
					zoom( statesByAbbr[ params.state.toUpperCase() ] );
				
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
							input.value = pref.example;
							this.submit();
							return false;
						},
						
						submit: function() {
							//spinner.style.backgroundPosition = '0px 0px';
							if( ! input.value ) input.value = pref.example;
							submit( input.value );
							return false;
						}
					};
					
					PollingPlaceSearch.focus();
					PollingPlaceSearch.blur();
					if( params.home )
						PollingPlaceSearch.submit();
					else
						input.focus();
				})();
			}
			else {
				if( pref.ready )
					submit( pref.address || pref.example );
			}
		});
	});
	
	analytics( 'view' );
}

function log() {
	if( arguments.length == 0 )
		log.log = [];
	else for( var i = -1, text;  text = arguments[++i]; )
		log.log.push( text );
}

log.print = function() {
	return log.yes ? S( '<div style="padding:4px; margin-bottom:4px; border:1px solid red;">', log.log.join('<br />'), '</div>' ) : '';
}

// Final initialization

maker ? makerWrite() : gadgetWrite();
$(function() {
	maker ? makerReady() : gadgetReady();
	$('body').click( function( event ) {
		var target = event.target;
		if( $(target).is('a')  &&  target.href != '#' )
			analytics( target.href );
	});
});
