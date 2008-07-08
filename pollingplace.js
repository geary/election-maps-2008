(function() {
	
	function e( id ) { return document.getElementById('PollingPlaceSearch'+id); }
	var wrapper = e('Wrapper'), spinner = e('Spinner'), input = e('Input'), button = e('Button');
	
	button.disabled = true;
	button.blur();
	wrapper.style.height = wrapper.offsetHeight + 400 + 'px';
	
})();
