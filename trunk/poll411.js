setTimeout( function() {
	
	var addr = encodeURIComponent( document.getElementById('PollingPlaceSearchInput').value );
	
	document.getElementById('PollingPlaceSearchFrameBox').innerHTML = [
		'<iframe ',
			'src="http://www.gmodules.com/ig/ifr?url=http://election-maps-2008.googlecode.com/svn/trunk/poll411-frame.xml&amp;synd=open&amp;nocache=1&amp;up_address=', addr, '" ',
			'style="width:100%; height:100%;" ',
			'frameborder="0" ',
			'scrolling="no" ',
		'/>'
	].join('');
	
}, 1 );
