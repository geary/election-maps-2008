// Copyright 2008 Michael Geary
// http://mg.to/
// Free Beer and Free Speech License (any OSI license)
// http://freebeerfreespeech.org/

window.console && typeof console.log == 'function' && console.log( location.href );  // TEMP

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

function fetch( url, callback ) {
	_IG_FetchContent( url, callback, {
		refreshInterval: opt.nocache ? 1 : opt.cache || 300
	});
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
	fontUnits: 'pt'
};
for( var name in pref ) pref[name] = prefs.getString(name) || pref[name];
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

var today = new Date;
today.setHours( 0, 0, 0, 0 );
var electionDay = new Date( 2008, 10, 4 );

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

mapplet = window.mapplet;
var map, $jsmap, currentAddress;
var home, vote;

var key = {
	'gmodules.com': 'ABQIAAAAL7MXzZBubnPtVtBszDCxeRTZqGWfQErE9pT-IucjscazSdFnjBSzjqfxm1CQj7RDgG-OoyNfebJK0w',
	'maps.gmodules.com': 'ABQIAAAAL7MXzZBubnPtVtBszDCxeRTqV_PyyxRizIwUkTfU6T-V7M7btRRpOM29SpcTDh2dojFpfRwpoTTMWw',
	'www.gmodules.com': 'ABQIAAAAL7MXzZBubnPtVtBszDCxeRSf0RMTBV-KKR6hvCL9Kx2eVMqFbxQJkQOf-iqm2g6XkyYWJQsN9S97qg',
	'': ''
}[location.host];

// HTML snippets

var infoLinks = ! mapplet ? '' : S(
	'<div style="', fontStyle, '">',
		'<div style="margin-top:1em; border-top:1px solid #BBB; padding-top:1em;">',
			'Full election coverage:<br />',
			'<a target="_blank" href="http://www.google.com/2008election">',
				'Google 2008 Election Site',
			'</a>',
		'</div>',
		'<div style="margin-top:1em;">',
			'Help others find their voter information:<br />',
			'<a target="_blank" href="http://gmodules.com/ig/creator?synd=open&url=http://election-maps-2008.googlecode.com/svn/trunk/poll411-gadget.xml">',
				'Get this gadget for your website',
			'</a>',
		'</div>',
		'<div style="margin:1em 0 1em 0;">',
			'<a target="_blank" href="http://maps.google.com/elections">',
				'More election gadgets',
			'</a>',
		'</div>',
	'</div>'
);

var attributeAlways = ! mapplet ? '' : S(
	'<div style="', fontStyle, '">',
		'<div style="margin-top:0.5em; border-top:1px solid #BBB; padding-top:1em;">',
			'In conjunction with the ',
			'<a target="_blank" href="http://www.lwv.org/">',
				'League of Women Voters',
			'</a>',
		'</div>',
	'</div>'
);

var attributeLater = ! mapplet ? '' : S(
	'<div style="', fontStyle, '">',
		'<div style="margin-top:1em;">',
			'Developed with the ',
			'<a target="_blank" href="http://votinginfoproject.org/">',
				'Voting Information Project',
			'</a>',
			' and State Election Officials from DC, DE, NH, OH, and VT.',
		'</div>',
	'</div>'
);

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
				'#title { padding-top:4px; }',
			'</style>'
		);
		
		//if( width >= 500 ) {
			var panelMin = 150;
			var panelWidth = ( panelMin + ( width - 500 ) * .75 ).toFixed();
			var mapWidth = width - panelWidth;
			//console.log( width, panelWidth, mapWidth );
			document.write(
				'<style type="text/css">',
					'#title { float:left; width:', panelWidth, 'px; xheight:100%; }',
					'#mapbox { float:left; width:', mapWidth, 'px; xheight:100%; }',
				'</style>'
			);
		//}
		//else {
		//}
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
							htmlEscape( pref.example ),
						'</a>',
					'</div>',
				'</div>',
			'</div>'
		);
	}
	else {
		writeScript( 'http://maps.google.com/maps?file=api&amp;v=2&amp;key=' + key );
	}
	
	writeBody = function() {
		document.write(
			'<div id="spinner">',
			'</div>',
			'<div id="wrapper">',
				'<div id="title">',
					attributeAlways,
				'</div>',
				'<div id="mapbox">',
				'</div>',
			'</div>'
		);
	};
	
	writeBody();
	
	if( mapplet ) {
		document.write(
			'</div>'  // #outerlimits
		);
	}
}

// Document ready code

function makerReady() {
	_IG_Analytics( 'UA-5730550-1', '/creator' );
}

function gadgetReady() {
	
	var locationWarning = S(
		'<div style="padding-top:1em; xline-height:1.2em; xcolor:gray; xfont-size:80%;">',
			'<span style="font-weight:bold;">',
				'Important: ',
			'</span>',
			'To ensure that this voting location is correct, please verify it with your local election officials.',
		'</div>'
	);
	
	var interpolatedLocationWarning = S(
		'<div style="padding-top:1em; xline-height:1.2em; xcolor:gray; xfont-size:80%;">',
			'<span style="font-weight:bold;">',
				'Important&nbsp; ',
			'</span>',
			'Verify your voting location with your local election officials. ',
			'This location is an estimate. ',
			'It may be incorrect and may change before election day.',
		'</div>'
	);
	
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
		
		var deadlineText = {
			mail: {
				left: 'Days left to register by mail',
				last: 'Last day to register by mail',
				mustbe: 'Registration must be postmarked by'
			},
			receive: {
				left: 'Days left for registration to be received by your election officials',
				last: 'Last day for registration to be received by your election officials by today.',
				mustbe: 'Registration must be <strong>received</strong> by'
			},
			inperson: {
				left: 'Days left to register in person',
				last: 'Last day to register in person',
				mustbe: 'In person registration allowed through'
			}
		};
		
		//var w = window.open();
		//w.document.write( biglist() );
		//w.document.close();
		
		var absentee = {
			'Early': 'Absentee ballot and early voting information',
			'Mail': 'Vote by mail information'
		}[state.gsx$absentee.$t] || 'Get an absentee ballot';
		return S(
			'<div style="margin-bottom:0.5em;">',
				'<div class="heading" style="font-size:110%; margin-bottom:0.75em;">',
					fix('Registration Info'),
				'</div>',
				'<div style="margin-bottom:0.75em;">',
					fix('State: <strong>%S</strong>'),
				'</div>',
				deadline( state, 'gsx$postmark', 'mail' )  ||
				deadline( state, 'gsx$receive', 'receive' ),
				deadline( state, 'gsx$inperson', 'inperson' ),
				sameDay,
				comments,
				mapplet ? S(
					'<div style="margin-bottom:0.75em;">',
						'Get information about voting in your state:',
					'</div>'
				) : '',
				'<ul style="margin-top:0; margin-bottom:0;">',
					election( 'gsx$areyouregistered', 'Are you registered to vote?' ),
					election( 'gsx$registrationinfo', 'How to register in %S', true ),
					election( 'gsx$absenteeinfo', absentee ),
					election( 'gsx$electionwebsite', '%S election website' ),
				'</ul>',
				'<div style="margin:1.0em 0 0.5em 0;">',
					state.name, ' voter hotline: ',
					'<span style="white-space:nowrap; font-weight:bold;">',
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
			if( ! before ) return '';
			var dt = deadlineText[type];
			var date = electionDay - before*days;
			var remain = Math.floor( ( date - today ) / days );
			return S(
				'<div style="margin-bottom:0.75em;',
						remain < 6 ? '' : '',
				'">',
					remain < 0 ? '' :
					remain < 1 ? dt.last :
					' ', dt.left, ': <strong>' + remain + '</strong>',
				'</div>',
				'<div style="margin-bottom:0.75em;">',
					dt.mustbe, ':<br />',
					'<strong>', formatDate(date), '</strong>',
				'</div>'
			);
		}
		
		function election( key, text, prefix ) {
			var url = state[key].$t;
			var size = mapplet ? 'font-size:110%;' : '';
			return ! url ? '' : S(
				'<li style="margin-bottom:0.5em; margin-left:-1.25em;">',
					'<a target="_blank" href="', url, '" style="', size, '">',
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
		var vertical = true;
		$title.append( vertical ? S(
			'<div>',
				electionInfo(),
				'<div style="padding-top:1em">',
				'</div>',
				formatHome(),
				'<div style="padding-top:0.75em">',
				'</div>',
				location(),
				locationWarning,
				infoLinks,
				attributeAlways,
				attributeLater,
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
			'<div style="', fontStyle, '">',
				location( true ),
				locationWarning,
			'</div>'
		);
		if( mapplet )
			_IG_AdjustIFrameHeight();
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
				map.enableGoogleBar();
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
		fetch( url, function( text ) {
			var json = eval( '(' + text + ')' );
			callback( json );
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
        if( addr == pref.example ) addr = addr.replace( /^.*: /, '' );
		home = {};
		vote = {};
		map && map.clearOverlays();
		currentAddress = addr;
		$title.empty();
		if( ! mapplet ) $title.height( height - $title.offset().top - 4 );
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
						sorry();
					}
				}
			});
		});
	}
	
	function formatHome( infowindow ) {
		return S(
			'<div style="', fontStyle, '">',
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
		$title.append( sorryHtml() );
		setMap( home.info );
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
		if( ! a ) return;
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
	
	//debugger;
	T( 'poll411-maker:style', variables, function( head ) {
		if( ! mapplet  &&  ! pref.ready ) {
			$('head').append( $(head) );
			$('body').prepend( T( 'poll411-maker:html', variables ) );
			
			setGadgetPoll411();
		}
		
		//var stateSheet = 'http://spreadsheets.google.com/feeds/list/p9CuB_zeAq5WrrUJlgUtNBg/2/public/values?alt=json';
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
							input.value = pref.example;
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
				if( pref.ready )
					submit( pref.address || pref.example );
			}
		});
	});
	
	_IG_Analytics( 'UA-5730550-1', mapplet ? '/mapplet' : '/gadget' );
}

// Final initialization

maker ? makerWrite() : gadgetWrite();
$( maker ? makerReady : gadgetReady );
