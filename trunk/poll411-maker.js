// poll411-maker.js
// Copyright 2008 Michael Geary
// http://mg.to/
// Free Beer and Free Speech License (any OSI license)
// http://freebeerfreespeech.org/

(function( $ ) {

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

Array.prototype.mapjoin = function( fun, delim ) {
	return this.map( fun ).join( delim || '' );
};

htmlEscape = function( text ) {
	var div = document.createElement( 'div' );
	div.appendChild( document.createTextNode(text) );
	return div.innerHTML;
};

$.extend( $.fn, {
	
	//html: function( a ) {
	//	if( a == null ) return this[0] && this[0].innerHTML;
	//	return this.empty().append( join( a.charAt ? arguments : a ) );
	//},
	
	setClass: function( cls, add ) {
		return this[ add ? 'addClass' : 'removeClass' ]( cls );
	},
	
	toggleSlide: function( speed, callback ) {
		return this[ this.is(':hidden') ? 'slideDown' : 'slideUp' ]( speed, callback );
	}
	
});

function join( array, delim ) {
	return Array.prototype.join.call( array, delim || '' );
}

T = function( name, values, give) {
	name = name.split(':');
	var url = opt.baseUrl + name[0] + '.html', part = name[1];
	if( T.urls[url] )
		return ready();
	
	_IG_FetchContent( url, function( data ) {
		var a = data.replace( /\r\n/g, '\n' ).split( /\n::/g );
		var o = T.urls[url] = {};
		for( var i = 1, n = a.length;  i < n;  ++i ) {
			var s = a[i], k = s.match(/^\S+/), v = s.replace( /^.*\n/, '' );
			o[k] = $.trim(v);
		}
		ready();
	}, {
		refreshInterval: opt.nocache ? 1 : opt.cache || 300
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

var opt = gadget;

var sampleAddr = '1600 Pennsylvania Ave 20006';

function writeScript( url ) {
	document.write( '<script type="text/javascript" src="', url, '"></script>' );
}

function cacheUrl( url, cache, always ) {
	if( opt.nocache  &&  ! always ) return url + '?q=' + new Date().getTime();
	if( opt.nocache ) cache = 0;
	if( typeof cache != 'number' ) cache = 300;
	url = _IG_GetCachedUrl( url, { refreshInterval:cache } );
	if( ! url.match(/^http:/) ) url = 'http://' + location.host + url;
	return url;
}

var userAgent = navigator.userAgent.toLowerCase(),
	msie = /msie/.test( userAgent ) && !/opera/.test( userAgent );

var p = new _IG_Prefs();
//function str( key, def ) { return p.getString(key) || ''+def || ''; }
var width = $(window).width();
var height = $(window).height();

document.write(
	'<style type="text/css">',
		'.popupOuter { z-index:1; position:absolute; background-color:white; display:none; }',
		'.popupInner { background-color:#E5ECF9; border:1px solid #3366CC; padding:8px; margin:4px; }',
	'</style>',
	'<div id="outerlimits">',
	'</div>',
	'<div id="getcode" class="popupOuter">',
		'<div class="popupInner">',
			'<div style="text-align:center;">',
				'<div style="margin-bottom:8px;">',
					'<button type="button" id="btnGetCode" style="font-size:34px;">',
						'Get the Code',
					'</button>',
				'</div>',
				'<div style="font-size:12px;">',
					'(use this button, not the one below)',
				'</div>',
			'</div>',
		'</div>',
	'</div>',
	'<div id="havecode" class="popupOuter" style="width:95%; height:85%;">',
		'<div class="popupInner">',
			'<div style="text-align:center;">',
				'<div style="font-size:16px; font-weight:bold; margin-bottom:8px;">',
					'Copy and paste the HTML below to include this gadget on your webpage.',
				'</div>',
				'<div style="font-size:12px;">',
					'<form id="codeform" name="codeform" style="margin:0; padding:0;">',
						'<textarea id="thecode" name="thecode" style="width:100%; height:80%; font-family: Consolas,Courier New,Courier,monospace;" value=""/>',
					'</form>',
				'</div>',
			'</div>',
		'</div>',
	'</div>'
);

var $getcode = $('#getcode'), $havecode = $('#havecode');
center( $getcode );
center( $havecode );

function center( $item ) {
	$item.css({
		left: ( width - $item.width() ) / 2,
		top: ( height - $item.height() ) / 2
	});
}

T( 'poll411-maker:gadget', {
	width: width,
	inputWidth: width - 100,
	height: height - 80,
	example: p.getString('example'),
	font: p.getString('font')
}, function( html ) {
	$('#outerlimits').html( html );
	$getcode.show();
	$('#btnGetCode').click( function() {
		$('#thecode').val( html );
		$havecode.show();
		document.codeform.thecode.focus()
		document.codeform.thecode.select()
	});
});

//document.write(
//	'<style type="text/css">',
//		'body.gadget { margin:0; padding:0; }',
//		'#wrapper, #wrapper * { font-family:Arial,sans-serif; font-size:10pt; }',
//		'#title { margin-bottom:4px; }',
//		'#title, #mapbox { overflow: auto; }',
//		'.heading { font-weight:bold; font-size:110%; }',
//		params.home ? '.removehelp { display:none; }' : '',
//	'</style>'
//);
//
//	document.write(
//		'<style type="text/css">',
//			'#spinner { z-index: 1; position:absolute; width:100%; height:100%; background-image:url(', baseUrl, 'spinner.gif); background-position:center; background-repeat:no-repeat; opacity:0.30; -moz-opacity:0.30; }',
//			'#spinner { filter:alpha(opacity=30); }',
//			'#title { padding-top:4px; }',
//		'</style>'
//	);
//	
//	var width = $(window).width(), height = $(window).height();
//	//if( width >= 500 ) {
//		var panelMin = 150;
//		var panelWidth = ( panelMin + ( width - 500 ) * .75 ).toFixed();
//		var mapWidth = width - panelWidth;
//		//console.log( width, panelWidth, mapWidth );
//		document.write(
//			'<style type="text/css">',
//				'#title { float:left; width:', panelWidth, 'px; height:100%; }',
//				'#mapbox { float:left; width:', mapWidth, 'px; height:100%; }',
//			'</style>'
//		);
//	//}
//	//else {
//	//}
//
//function getJSON( url, callback, cache ) {
//	_IG_FetchContent( url, function( text ) {
//		var json = eval( '(' + text + ')' );
//		callback( json );
//	}, {
//		refreshInterval: cache || 300
//	});
//}

//});  // end $(function(){})

})( jQuery );
