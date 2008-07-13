(function() {

var key = {
	'mg.to': 'ABQIAAAAL7MXzZBubnPtVtBszDCxeRQjDwyFD3YNj60GgWGUlJCU_q5i9hSSSzj0ergKKMY55eRpMa05FE3Wog',
	's.mg.to': 'ABQIAAAAL7MXzZBubnPtVtBszDCxeRQ9jbX8zKuYy1oz9F5p7GBNeAnoJRS9Itc8RizuhplTF59tia4NLgrdHQ',
	'padlet': 'ABQIAAAAL7MXzZBubnPtVtBszDCxeRSuIOvo2pGs7VouOPMgaUBd9TDiaBTE5gjPTrifBPED7VUFoeKD_Ysmkw',
	'': ''
}[location.host];

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
	$box.empty();
	
	geocode( $address.val(), function( geo ) {
		var places = geo && geo.Placemark;
		var n = places && places.length;
		$box.append(
			! n ? ( spin(false), 'No match for that address.' ) :
			n == 1 ? 'Your full address:' :
			'Select your address:' );
		$box.append( formatPlaces(places) );
		$hider.slideDown( 'slow', function() {
			if( n == 1 ) {
				findPrecinct( places[0] );
			}
			else if( n ) {
				$('input:radio',$box).click( function() {
					spin( true );
					findPrecinct( places[ this.id.split('-')[1] ] );
				});
			}
		});
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
		$('.PollingPlaceSearchPlaceRadioResult',$box).slideUp('slow');
		$('#'+place.extra.result).html( html ).slideDown( 'slow', function() {
			spin( false );
		});
	}
}

function formatPlaces( places ) {
	if( ! places ) return '<br />Check the address and spelling and click Search again.';
	
	var checked = '';
	if( places.length == 1 ) checked = 'checked="checked" ';
	else spin( false );
	var list = places.map( function( place, i ) {
		var id = 'PollingPlaceSearchPlaceRadio-' + i;
		var result = id + '_Result';
		place.extra = { index:i, id:id, result:result };
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
					'<div id="', result, '" class="PollingPlaceSearchPlaceRadioResult" style="display:none;">',
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
	var street = locality.Thoroughfare.ThoroughfareName;
	var city = locality.LocalityName;
	var state = area.AdministrativeAreaName;
	var zip = locality.PostalCode.PostalCodeNumber;
	var coord = place.Point.coordinates;
	var latlng = [ coord[1], coord[0] ].join();
	var width = 450; // $box.width();
	var height = 300;  // ?
	var map = staticmap({
		key: key,
		center: latlng,
		zoom: 15,
		size: [ width, height ].join('x'),
		markers: [ latlng, 'green' ].join()
	});
	return S(
		'<div>',
			'<div style="font-weight:bold;">',
				'Your Voting Place',
			'</div>',
			'<div>',
				street,
			'</div>',
			'<div>',
				city, ', ', state, ' ', zip,
			'</div>',
		'</div>',
		'<div>',
			'<img style="width:', width, 'px; height:', height, 'px;" src="', map, '" alt="', address, '" title="Your voting place: ', address, '" />',
		'</div>'
	);
}

submit();

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

})();

//'http://www.gmodules.com/ig/ifr?url=http://primary-maps-2008.googlecode.com/svn/trunk/twitter-gadget.xml&amp;synd=open&amp;w=' + width + '&amp;h=' + height + '&amp;title=Twitter+Election+Map&amp;border=%23ffffff%7C3px%2C1px+solid+%23999999&amp;output=js';
