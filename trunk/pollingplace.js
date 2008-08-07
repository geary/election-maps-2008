setTimeout( function() {
	
	var type = 'a';  // document.getElementById('ApiMap').checked ? 'a' : 's';  // TEMP
	
	var addr = encodeURIComponent( document.getElementById('PollingPlaceSearchInput').value );
	
	var host = location.host;
	if( host in { 'gigapad':1, 'gigapad.local':1, 'padlet':1, 'padlet.local':1 } )
		var base = 'http://' + host + '/election-general/', cache = '?' + (+new Date);
	else if( host in { 's.mg.to':1 } )
		var base = 'http://' + host + '/elections/', cache = '?' + (+new Date);
	else
		var base = 'http://?/?/', cache = '';
	
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