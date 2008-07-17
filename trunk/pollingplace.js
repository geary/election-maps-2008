setTimeout( function() {
	
	var type = document.getElementById('ApiMap').checked ? 'a' : 's';  // TEMP
	
	var addr = encodeURIComponent( document.getElementById('PollingPlaceSearchInput').value );
	
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
			'src="', base, 'pollingplace-frame.html', cache, '#', type, addr, '" ',
			'id="PollingPlaceSearchResultFrame" ',
			'style="width:100%; height:100%;" ',
			'frameborder="0" ',
			'scrolling="no" ',
		'/>'
	].join('');
	
}, 1 );
