(function() {
	
	function e( id ) { return document.getElementById('PollingPlaceSearch'+id); }
	var hider = e('FrameHider'), box = e('FrameBox'), spinner = e('Spinner'), input = e('Input'), button = e('Button');
	
	button.disabled = true;
	button.blur();
	
	hider.style.display = 'block';
	var width = box.offsetWidth, height = box.offsetHeight;
	
	var iframe = document.createElement('iframe');
	iframe.width = '' + width;
	iframe.height = '' + height;
	iframe.frameborder = '0';
	iframe.scrolling = 'no';
	iframe.src = 'http://gmodules.com/ig/ifr?url=http://primary-maps-2008.googlecode.com/svn/trunk/twitter-gadget.xml&synd=open&w=' + width + '&h=' + height + '&title=Twitter+Election+Map&border=%23ffffff%7C3px%2C1px+solid+%23999999&source=http%3A%2F%2Fgmodules.com%2Fig%2Fcreator%3Fsynd%3Dopen%26url%3Dhttp%3A%2F%2Fprimary-maps-2008.googlecode.com%2Fsvn%2Ftrunk%2Ftwitter-gadget.xml';
	//iframe.src = 'http://www.gmodules.com/ig/ifr?url=http://primary-maps-2008.googlecode.com/svn/trunk/twitter-gadget.xml&amp;synd=open&amp;w=' + width + '&amp;h=' + height + '&amp;title=Twitter+Election+Map&amp;border=%23ffffff%7C3px%2C1px+solid+%23999999&amp;output=js';
	box.appendChild( iframe );
	
})();
