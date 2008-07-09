(function() {
	
	function spin( yes ) {
		$('#PollingPlaceSearchSpinner').css({ backgroundPosition: yes ? '0px 0px' : '1000px 0px' });
	}
	
	setTimeout( function() {
		spin( false );
		$('#PollingPlaceSearchFrameHider').slideDown( 'slow', function() {
			var $box = $('#PollingPlaceSearchFrameBox'), width = $box.width(), height = $box.height();
			
			$('<iframe>').attr({
				width: '' + ( width - 8 ),
				height: '' + height,
				frameborder: '0',
				scrolling: 'no',
				src: 'http://gmodules.com/ig/ifr?url=http://primary-maps-2008.googlecode.com/svn/trunk/twitter-gadget.xml&synd=open&w=' + width + '&h=' + height + '&title=Twitter+Election+Map&border=%23ffffff%7C3px%2C1px+solid+%23999999&source=http%3A%2F%2Fgmodules.com%2Fig%2Fcreator%3Fsynd%3Dopen%26url%3Dhttp%3A%2F%2Fprimary-maps-2008.googlecode.com%2Fsvn%2Ftrunk%2Ftwitter-gadget.xml'
			}).appendTo( $box );
		});
	}, 1000 );

})();

//'http://www.gmodules.com/ig/ifr?url=http://primary-maps-2008.googlecode.com/svn/trunk/twitter-gadget.xml&amp;synd=open&amp;w=' + width + '&amp;h=' + height + '&amp;title=Twitter+Election+Map&amp;border=%23ffffff%7C3px%2C1px+solid+%23999999&amp;output=js';
