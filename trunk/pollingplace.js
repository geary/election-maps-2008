setTimeout( function() {
	
	var addr = encodeURIComponent( document.getElementById('PollingPlaceSearchInput').value );
	console.log( addr );
	
	if( location.host == 'padlet' ) {
		var base = 'http://padlet/election-general/', cache = '?' + (+new Date);
	}
	else if( location.host == 's.mg.to' ) {
		var base = 'http://s.mg.to/elections/', cache = '?' + (+new Date);
	}
	else {
		var base = 'http://?/?/', cache = '';
	}
	
	document.getElementById('PollingPlaceSearchFrameBox').innerHTML = [
		'<iframe ',
			'src="', base, 'pollingplace-frame.html', cache, '#', addr, '" ',
			'id="PollingPlaceSearchResultFrame" ',
			'style="width:100%; height:100%;" ',
			'frameborder="0" ',
		'/>'
	].join('');
	
}, 1 );
