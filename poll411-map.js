// Copyright 2008 Michael Geary
// http://mg.to/
// Free Beer and Free Speech License (any OSI license)
// http://freebeerfreespeech.org/

var img = _IG_GetCachedUrl( 'http://election-maps-2008.googlecode.com/svn/trunk/vote-icon-50.png' );

document.write(
	'<div style="margin-top:1em; font-family:Arial,sans-serif; font-size:10pt;">',
		'<table>',
			'<tr>',
				'<td>',
				'<img src="', img, '" style="width:50px; height:50px;" />',
				'</td>',
				'<td>',
					'<div style="font-size:11pt; font-weight:bold; padding-left:8px;">',
						'Thank you for voting in the<br />November 4th general election!',
					'</div>',
				'</td>',
			'</tr>',
		'</table>',
		'<div style="margin-top:1em; padding-top:1em; border-top:1px solid #DDD;">',
			'Louisiana voters in US House districts 2 and 4: ',
			"Don't forget to vote in the general election on December 6. ",
		'</div>',
		'<div style="margin-top:1em;">',
			'<a target="_blank" href="https://pollinglocator.sos.louisiana.gov/">',
				'Find your Louisiana voting place',
			'</a>',
		'</div>',
	'</div>'
);
