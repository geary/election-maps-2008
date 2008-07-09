(function() {

var key = 'ABQIAAAAL7MXzZBubnPtVtBszDCxeRQjDwyFD3YNj60GgWGUlJCU_q5i9hSSSzj0ergKKMY55eRpMa05FE3Wog';

var win$ = window.jQuery_window || window, doc$ = win$.document;

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

function spin( yes ) {
	$('#PollingPlaceSearchSpinner').css({ backgroundPosition: yes ? '0px 0px' : '1000px 0px' });
}

var $form = $('#PollingPlaceSearchForm');
var $address = $('#PollingPlaceSearchInput');
var $hider = $('#PollingPlaceSearchFrameHider');
var $box = $('#PollingPlaceSearchFrameBox');

function geocode( address, callback ) {
	var url = S(
		'http://maps.google.com/maps/geo?output=json&oe=utf-8&q=',
		encodeURIComponent(address), '&key=', key, '&callback=?'
	);
	$.getJSON( url, callback );
}

function lookup() {
	$box.empty();
	
	geocode( $address.val(), function( geo ) {
		var places = geo && geo.Placemark;
		$box.append(
			! places || places.length == 0 ? 'No match for that address.' :
			places.length == 1 ? 'Your full address:' :
			'Select your address:' );
		$box.append( formatPlaces(places) );
		$hider.slideDown( 'slow', function() {
			// HACK
			setTimeout( function() {
				var location = {
					precinct: 'Des Moines 24',
					name: 'Cattell Elementary',
					address: '3101 E 12th St',
					city: 'Des Moines'
				};
				$('#PollingPlaceSearchPlaceRadio0_Result').html( S(
					'<div style="border:1px solid rgb(255,153,0); background-color:white; margin:4px; padding:4px;">',
						formatPrecinct( location ),
					'</div>'
				) ).slideDown( 'slow' );
				//markPrecinct( location );
			}, 500 );
			// END HACK
		});
	});
}

function formatPlaces( places ) {
	if( ! places ) return 'Check the address and spelling and click Search again.';
	
	var list = places.map( function( place, i ) {
		var id = 'PollingPlaceSearchPlaceRadio' + i;
		var checked = ( i == 0 ? 'checked="checked" ' : '' );
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
					'<div id="', id, '_Result" style="display:none;">',
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

function formatPrecinct( location ) {
	return S(
		'<div style="font-weight:bold;">Caucus Location</div>',
		'<table>',
			'<tr>',
				'<td>',
					'Precinct:&nbsp;',
				'</td>',
				'<td>',
					location.precinct,
				'</td>',
			'</tr>',
			'<tr>',
				'<td>',
					'Location:&nbsp;',
				'</td>',
				'<td>',
					location.name,
				'</td>',
			'</tr>',
			'<tr>',
				'<td>',
					'Address:&nbsp;',
				'</td>',
				'<td>',
					location.address,
				'</td>',
			'</tr>',
			'<tr>',
				'<td>',
					'City:&nbsp;',
				'</td>',
				'<td>',
					location.city,
				'</td>',
			'</tr>',
		'</table>'
	);
}

function markPrecinct( location ) {
	var address = S( location.address, ', ', location.city, ', IA' );
	var coder = new GClientGeocoder;
	GAsync( coder, 'getLocations', [ address ], function( geo ) {
		var places = geo && geo.Placemark;
		//$loading.html(
		//	! places || places.length == 0 ? 'No match for that address.' :
		//	places.length == 1 ? 'Full address:' :
		//	'Select your address:' );
		var html = S(
			'<div>',
				formatPrecinct( location ),
			'</div>'
		);
		var coords = places[0].Point.coordinates;
		var latlng = new GLatLng( coords[1], coords[0] );
		
		var icon = new GIcon;
		icon.image = 'http://www.google.com/intl/en_us/mapfiles/arrow-white.png';
		icon.shadow = 'http://www.google.com/intl/en_us/mapfiles/arrowshadow.png';
		icon.iconSize = new GSize( 23, 34 );
		icon.shadowSize = new GSize( 39, 34 );
		icon.iconAnchor = new GPoint( 12, 34 );
		icon.infoWindowAnchor = new GPoint( 12, 0 );
		
		map.clearOverlays();
		var marker = new GMarker( latlng, icon );
		map.addOverlay( marker );
		map.setCenter( latlng, 15 );
		marker.openInfoWindow( html );
	});
}

$.opener = function( link, box ) {
	var $link = $(link), $box = $(box);
	var moving = false;
	$link.click( function() {
		if( ! moving ) {
			moving = true;
			var show = $box.is(':hidden');
			$box.slideToggle( 'slow', function() {
				if( show ) $box.find('input:first').focus();
				moving = false;
				adjustHeight();
			});
		}
		return false;
	});
};

setTimeout( function() {
	spin( false );
	lookup();
	//$hider.slideDown( 'slow', function() {
	//	var width = $box.width(), height = $box.height();
	//	
	//	$('<iframe>').attr({
	//		width: '' + ( width - 8 ),
	//		height: '' + height,
	//		frameborder: '0',
	//		scrolling: 'no',
	//		src: 'http://gmodules.com/ig/ifr?url=http://primary-maps-2008.googlecode.com/svn/trunk/twitter-gadget.xml&synd=open&w=' + width + '&h=' + height + '&title=Twitter+Election+Map&border=%23ffffff%7C3px%2C1px+solid+%23999999&source=http%3A%2F%2Fgmodules.com%2Fig%2Fcreator%3Fsynd%3Dopen%26url%3Dhttp%3A%2F%2Fprimary-maps-2008.googlecode.com%2Fsvn%2Ftrunk%2Ftwitter-gadget.xml'
	//	}).appendTo( $box );
	//});
}, 1000 );

})();

//'http://www.gmodules.com/ig/ifr?url=http://primary-maps-2008.googlecode.com/svn/trunk/twitter-gadget.xml&amp;synd=open&amp;w=' + width + '&amp;h=' + height + '&amp;title=Twitter+Election+Map&amp;border=%23ffffff%7C3px%2C1px+solid+%23999999&amp;output=js';
