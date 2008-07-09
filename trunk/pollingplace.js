setTimeout( function() {
	
	var base = 'http://padlet/election-general/', cache = '?' + (+new Date);
	
	var frame = document.createElement( 'iframe' );
	frame.id = 'PollingPlaceSearchCodeFrame';
	frame.style.width = '0px';
	frame.style.height = '0px';
	frame.setAttribute( 'frameborder', '0' );
	document.body.appendChild( frame );
	
	var doc = frame.contentWindow.document;
	doc.open();
	doc.write(
		'<html>',
			'<head>',
			'</head>',
			'<body>',
				'<script type="text/javascript">jQuery_window = window.parent;<\/script>',
				'<script type="text/javascript" src="', base, 'jquery-1.2.6-frame.js"><\/script>',
				'<script type="text/javascript" src="', base, 'pollingplace-frame.js', cache, '"><\/script>',
			'</body>',
		'</html>'
	);
	doc.close();
	
}, 1 );
