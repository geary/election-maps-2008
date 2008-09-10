// Copyright 2008 Michael Geary
// http://mg.to/
// Free Beer and Free Speech License (MIT+GPL)
// http://freebeerfreespeech.org/

var opt = window.mapplet ? mapplet : {};

var baseUrl = opt.baseUrl || 'http://poll411.s3.amazonaws.com/';
var dataUrl = opt.dataUrl || baseUrl;

var sampleAddr = '1600 Pennsylvania Ave 20006';

function parseQuery( query ) {
	var params = {};
	if( query ) {
		var array = query.split( '&' );
		for( var i = 0, n = array.length;  i < n;  ++i ) {
			var p = array[i].split( '=' ),
				k = decodeURIComponent(p[0]),
				v = decodeURIComponent(p[1]);
			if( k ) params[k] = v;
		}
	}
	return params;
}

var params = parseQuery( unescape(location.search).replace( /^\?[^?]*\?/, '' ) );

if( ! Array.prototype.forEach ) {
	Array.prototype.forEach = function( fun /*, thisp*/ ) {
		if( typeof fun != 'function' )
			throw new TypeError();
		
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
		if( typeof fun != 'function' )
			throw new TypeError();
		
		var res = new Array( len );
		var thisp = arguments[1];
		for( var i = 0;  i < len;  ++i ) {
			if( i in this )
				res[i] = fun.call( thisp, this[i], i, this );
		}
		
		return res;
	};
}

Array.prototype.mapjoin = function( fun, delim ) {
	return this.map( fun ).join( delim || '' );
};

function S() {
	return Array.prototype.join.call( arguments, '' );
}

function htmlEscape( str ) {
	var div = document.createElement( 'div' );
	div.appendChild( document.createTextNode( str ) );
	return div.innerHTML;
}

function cacheUrl( url, cache, always ) {
	if( opt.nocache  &&  ! always ) return url + '?q=' + new Date().getTime();
	if( opt.nocache ) cache = 0;
	if( typeof cache != 'number' ) cache = 300;
	url = _IG_GetCachedUrl( url, { refreshInterval:cache } );
	if( ! url.match(/^http:/) ) url = 'http://' + location.host + url;
	return url;
}

var states = [
	{ "abbr":"AL", "name":"Alabama", "bounds":[[-88.4711,30.2198],[-84.8892,35.0012]] },
	{ "abbr":"AK", "name":"Alaska", "bounds":[[172.4613,51.3718],[-129.9863,71.3516]] },
	{ "abbr":"AZ", "name":"Arizona", "bounds":[[-114.8152,31.3316],[-109.0425,37.0003]] },
	{ "abbr":"AR", "name":"Arkansas", "bounds":[[-94.6162,33.0021],[-89.7034,36.5019]] },
	{ "abbr":"CA", "name":"California", "bounds":[[-124.4108,32.5366],[-114.1361,42.0062]] },
	{ "abbr":"CO", "name":"Colorado", "bounds":[[-109.0480,36.9948],[-102.0430,41.0039]] },
	{ "abbr":"CT", "name":"Connecticut", "bounds":[[-73.7272,40.9875],[-71.7993,42.0500]] },
	{ "abbr":"DE", "name":"Delaware", "bounds":[[-75.7865,38.4517],[-75.0471,39.8045]] },
	{ "abbr":"DC", "name":"District of Columbia", "bounds":[[-77.1174,38.7912],[-76.9093,38.9939]] },
	{ "abbr":"FL", "name":"Florida", "bounds":[[-87.6003,24.5457],[-80.0312,31.0030]] },
	{ "abbr":"GA", "name":"Georgia", "bounds":[[-85.6067,30.3567],[-80.8856,35.0012]] },
	{ "abbr":"HI", "name":"Hawaii", "bounds":[[-159.7644,18.9483],[-154.8078,22.2290]] },
	{ "abbr":"ID", "name":"Idaho", "bounds":[[-117.2415,41.9952],[-111.0471,49.0002]] },
	{ "abbr":"IL", "name":"Illinois", "bounds":[[-91.5108,36.9838],[-87.4962,42.5101]] },
	{ "abbr":"IN", "name":"Indiana", "bounds":[[-88.0275,37.7835],[-84.8070,41.7597]] },
	{ "abbr":"IA", "name":"Iowa", "bounds":[[-96.6372,40.3795],[-90.1635,43.5014]] },
	{ "abbr":"KS", "name":"Kansas", "bounds":[[-102.0539,36.9948],[-94.5943,40.0016]] },
	{ "abbr":"KY", "name":"Kentucky", "bounds":[[-89.4186,36.4964],[-81.9700,39.1198]] },
	{ "abbr":"LA", "name":"Louisiana", "bounds":[[-94.0412,28.9273],[-88.8162,33.0185]] },
	{ "abbr":"ME", "name":"Maine", "bounds":[[-71.0818,43.0578],[-66.9522,47.4612]] },
	{ "abbr":"MD", "name":"Maryland", "bounds":[[-79.4889,37.9149],[-75.0471,39.7223]] },
	{ "abbr":"MA", "name":"Massachusetts", "bounds":[[-73.4862,41.2668],[-69.9262,42.8880]] },
	{ "abbr":"MI", "name":"Michigan", "bounds":[[-90.4154,41.6940],[-82.4136,48.1897]] },
	{ "abbr":"MN", "name":"Minnesota", "bounds":[[-97.2287,43.5014],[-89.4898,49.3836]] },
	{ "abbr":"MS", "name":"Mississippi", "bounds":[[-91.6532,30.1815],[-88.0987,34.9957]] },
	{ "abbr":"MO", "name":"Missouri", "bounds":[[-95.7664,35.9980],[-89.1338,40.6096]] },
	{ "abbr":"MT", "name":"Montana", "bounds":[[-116.0475,44.3613],[-104.0475,49.0002]] },
	{ "abbr":"NE", "name":"Nebraska", "bounds":[[-104.0530,40.0016],[-95.3063,43.0030]] },
	{ "abbr":"NV", "name":"Nevada", "bounds":[[-120.0019,35.0012],[-114.0429,42.0007]] },
	{ "abbr":"NH", "name":"New Hampshire", "bounds":[[-72.5551,42.6963],[-70.7039,45.3033]] },
	{ "abbr":"NJ", "name":"New Jersey", "bounds":[[-75.5620,38.9336],[-73.8915,41.3599]] },
	{ "abbr":"NM", "name":"New Mexico", "bounds":[[-109.0480,31.3316],[-103.0014,37.0003]] },
	{ "abbr":"NY", "name":"New York", "bounds":[[-79.7628,40.5438],[-71.8541,45.0185]] },
	{ "abbr":"NC", "name":"North Carolina", "bounds":[[-84.3196,33.8455],[-75.5182,36.5895]] },
	{ "abbr":"ND", "name":"North Dakota", "bounds":[[-104.0475,45.9332],[-96.5606,49.0002]] },
	{ "abbr":"OH", "name":"Ohio", "bounds":[[-84.8180,38.4243],[-80.5186,41.9788]] },
	{ "abbr":"OK", "name":"Oklahoma", "bounds":[[-103.0014,33.6374],[-94.4300,37.0003]] },
	{ "abbr":"OR", "name":"Oregon", "bounds":[[-124.5532,41.9952],[-116.4638,46.2618]] },
	{ "abbr":"PA", "name":"Pennsylvania", "bounds":[[-80.5186,39.7223],[-74.6966,42.2691]] },
	{ "abbr":"PR", "name":"Puerto Rico", "bounds":[[-67.2699,17.9350],[-65.2763,18.5156]] },
	{ "abbr":"RI", "name":"Rhode Island", "bounds":[[-71.8596,41.3216],[-71.1202,42.0171]] },
	{ "abbr":"SC", "name":"South Carolina", "bounds":[[-83.3392,32.0327],[-78.5414,35.2148]] },
	{ "abbr":"SD", "name":"South Dakota", "bounds":[[-104.0585,42.4882],[-96.4346,45.9441]] },
	{ "abbr":"TN", "name":"Tennessee", "bounds":[[-90.3114,34.9847],[-81.6797,36.6771]] },
	{ "abbr":"TX", "name":"Texas", "bounds":[[-106.6162,25.8383],[-93.5154,36.5019]] },
	{ "abbr":"UT", "name":"Utah", "bounds":[[-114.0484,37.0003],[-109.0425,42.0007]] },
	{ "abbr":"VT", "name":"Vermont", "bounds":[[-73.4314,42.7291],[-71.5036,45.0130]] },
	{ "abbr":"VA", "name":"Virginia", "bounds":[[-83.6733,36.5512],[-75.2443,39.4649]] },
	{ "abbr":"WA", "name":"Washington", "bounds":[[-124.7285,45.5443],[-116.9183,49.0002]] },
	{ "abbr":"WV", "name":"West Virginia", "bounds":[[-82.6437,37.2029],[-77.7199,40.6370]] },
	{ "abbr":"WI", "name":"Wisconsin", "bounds":[[-92.8855,42.4936],[-86.9704,46.9628]] },
	{ "abbr":"WY", "name":"Wyoming", "bounds":[[-111.0525,40.9984],[-104.0530,45.0021]] }
];

var stateUS = {
	'abbr': 'US',
	'name': 'United States',
	bounds: [
		[ -124.72846051, 24.54570037 ],
		[ -66.95221658, 49.38362494 ]
	]
};

var statesByAbbr = {};
var statesByName = {};
states.forEach( function( state ) {
	statesByAbbr[state.abbr] = state;
	statesByName[state.name] = state;
});

function stateByAbbr( abbr ) {
	if( typeof abbr != 'string' ) return abbr;
	return statesByAbbr[abbr.toUpperCase()] || stateUS;
}

// This awkward tab-delimited data is a quick and dirty spreadsheet import.
// State AreYouRegistered RegistrationInfo AbsenteeInfo WhereToVote ElectionWebsite
var stateUrlTabbed = [
	'Alabama		http://www.sos.state.al.us/Elections/VoterRegistrationInfo.aspx	http://www.sos.state.al.us/Elections/AbsenteeVotingInfo.aspx		http://www.sos.state.al.us/Elections/Default.aspx														',
	'Alaska		http://ltgov.state.ak.us/elections/regapp.php	http://www.elections.alaska.gov/abinfo.php		http://www.elections.alaska.gov/														',
	'Arizona	https://servicearizona.com/webapp/evoter/select_language.do	http://www.azsos.gov/election/How_to_register.htm	http://www.azsos.gov/election/Military.htm		http://www.azsos.gov/election/														',
	'Arkansas	https://www.voterview.ar-nova.org/	http://www.votenaturally.org/all_about_voting.html	http://www.votenaturally.org/all_about_voting_absentee.html	https://www.voterview.ar-nova.org/	http://www.sos.arkansas.gov/elections.html														',
	'California		http://www.sos.ca.gov/elections/elections_vr.htm	http://www.sos.ca.gov/elections/elections_mov.htm		http://www.sos.ca.gov/elections/elections.htm														',
	'Colorado	http://www.sos.state.co.us/Voter/voterHome.do;jsessionid=0000QlBp7qrdd1E9ysKzDFyDdlc:121vl9gps	http://www.elections.colorado.gov/WWW/default/Clerks%20Corner/SOS%20Approved%20Forms/2008_forms/approved_registration_form_37_combo_VR_application_english_color_06.26.08.pdf	http://www.elections.colorado.gov/WWW/default/Clerks%20Corner/SOS%20Approved%20Forms/2008_forms/approved_mail-in_ballot_form_17_mail-in_ballot_application_english_color_06.17.08.pdf		http://www.elections.colorado.gov														',
	'Connecticut		http://www.ct.gov/sots/LIB/sots/ElectionServices/ElectForms/electforms/ed671.pdf	http://www.ct.gov/sots/LIB/sots/ElectionServices/ElectForms/electforms/aabeng.pdf		http://www.ct.gov/sots/cwp/view.asp?a=3179&q=392220&SOTSNav_GID=1846														',
	'Delaware	http://pollingplace.delaware.gov/	https://registertovote.elections.delaware.gov/VoterRegistration/TermsAgreement	http://electionsncc.delaware.gov/absentee_de/index.shtml	http://pollingplace.delaware.gov/	http://elections.delaware.gov/														',
	'District of Columbia	http://www.dcboee.org/voter_info/reg_status/	http://www.dcboee.org/voter_info/register_to_vote/ovr_step1.asp	http://www.dcboee.org/voter_info/absentee_ballot/ab_step1.asp	http://www.dcboee.org/voter_info/find_pollingplace/	http://www.dcboee.org/														',
	'Florida		http://election.dos.state.fl.us/voter-registration/voter-reg.shtml	http://election.dos.state.fl.us/voting/absentee.shtml		http://election.dos.state.fl.us/														',
	'Georgia			http://www.sos.georgia.gov/elections/Voting_information.htm#Absentee_Voting	http://sos.georgia.gov/elections/polllocator/	http://sos.georgia.gov/Elections/														',
	'Hawaii		http://hawaii.gov/elections/voters/registration.htm	http://hawaii.gov/elections/voters/voteabsentee.htm		http://hawaii.gov/elections/														',
	'Idaho		http://www.idahovotes.gov/VoterReg/vtr_reg_form.pdf	http://www.idahovotes.gov/VoterReg/ABSENTEE.HTM	http://idahovotes.gov/YourPollingPlace/WhereDoIVote.aspx	http://www.idahovotes.gov/														',
	'Illinois		http://www.elections.il.gov/Downloads/ElectionInformation/PDF/registervote.pdf	http://www.elections.il.gov/Downloads/ElectionInformation/PDF/absevote.pdf		http://www.elections.state.il.us/														',
	'Indiana	http://indianavoters.com/PublicSite/Public/FT1/PublicLookupMain.aspx?Link=Polling	http://www.in.gov/sos/elections/vote_reg.html	http://www.in.gov/sos/elections/absentee.html	http://indianavoters.com/PublicSite/(X(1)A(GhFR-WUMoVaxvzpadIyulJoNZjMAfU8JsSK0HBoAU__zygJpD-v1sqWghuffVMM16mMsiiz10HH37frJTHrnQKnNtqRQzVrG1EYr1Ybh1WA1))/PublicMain.aspx	http://www.indianavoters.com/														',
	'Iowa	http://www.sos.state.ia.us/elections/VoterReg/RegToVote/search.aspx	http://www.sos.state.ia.us/elections/voterreg/reg_to_vote.html	http://www.sos.state.ia.us/elections/voterreg/Military_Overseas_Voting.html	http://www.sos.state.ia.us/elections/VoterReg/PollingPlace/search.aspx	http://www.sos.state.ia.us/elections/														',
	'Kansas	https://myvoteinfo.voteks.org/	http://www.kssos.org/forms/elections/voterregistration.pdf	http://www.kssos.org/forms/elections/AV1.pdf	https://myvoteinfo.voteks.org/	http://www.kssos.org/elections/elections.html														',
	'Kentucky	https://cdcbp.ky.gov/VICWeb/index.jsp	http://www.elect.ky.gov/register.htm	http://elect.ky.gov/registrationinfo/absenteeballot.htm	https://cdcbp.ky.gov/VICWeb/index.jsp	http://elect.ky.gov/default.htm														',
	'Louisiana	http://www.sos.louisiana.gov/tabid/68/Default.aspx	http://www.sos.louisiana.gov/tabid/457/Default.aspx	http://www.sos.louisiana.gov/tabid/169/Default.aspx	https://pollinglocator.sos.louisiana.gov/	http://www.sos.louisiana.gov/tabid/68/Default.aspx														',
	'Maine		http://maine.gov/sos/cec/elec/votreg.htm	http://maine.gov/sos/cec/elec/absent.htm	http://www.maine.gov/portal/government/edemocracy/lookup_polling_place.php	http://www.maine.gov/sos/cec/														',
	'Maryland	http://mdelections.umbc.edu/voter_registration/v2/vote_prod.php	http://www.elections.state.md.us/voter_registration/index.html	http://www.elections.state.md.us/voting/absentee.html	http://mdelections.umbc.edu/voter_registration/v2/vote_prod.php	http://www.elections.state.md.us/														',
	'Massachusetts		http://www.sec.state.ma.us/ele/eleifv/howreg.htm	http://www.sec.state.ma.us/ele/eleifv/howabs.htm	http://www.wheredoivotema.com/bal/myelectioninfo.php	http://www.sec.state.ma.us/ele/eleidx.htm														',
	'Michigan	http://michigan.gov/sos/0,1607,7-127-1633-49313--,00.html	http://www.michigan.gov/sos/0,1607,7-127-1633_8716_8726_47669---,00.html	http://www.michigan.gov/sos/0,1607,7-127-1633_11619-123989--,00.html#7	https://services2.sos.state.mi.us/mivote/	http://www.mi.gov/sos/0,1607,7-127-1633-49313--,00.html														',
	'Minnesota		http://www.sos.state.mn.us/home/index.asp?page=204	http://www.sos.state.mn.us/home/index.asp?page=211#generalabsenteeinfo	http://pollfinder.sos.state.mn.us/	http://www.sos.state.mn.us/home/index.asp?page=4														',
	'Mississippi		http://www.sos.state.ms.us/Elections/voterinfoguide.asp	http://www.sos.state.ms.us/Elections/voterinfoguide.asp		http://www.sos.state.ms.us/elections/elections.asp														',
	'Missouri		http://www.sos.mo.gov/elections/s_default.asp?id=voter	http://www.sos.mo.gov/elections/s_default.asp?id=absentee	http://mcvr.mo.gov/PollingPlaceLookup/	http://www.sos.mo.gov/elections/														',
	'Montana		http://sos.mt.gov/elb/voter_information.asp#register	http://sos.mt.gov/elb/voter_information.asp#absentee		http://sos.mt.gov/ELB/														',
	'Nebraska	https://www.votercheck.necvr.ne.gov/	http://www.sos.state.ne.us/elec/vote_reg_page.html	http://www.sos.state.ne.us/elec/absentee_page.html	https://www.votercheck.necvr.ne.gov/	http://www.sos.ne.gov/elec/2008/index.html														',
	'Nevada	http://www.nvsos.gov/elections/	http://sos.state.nv.us/elections/voter/registration.asp	http://sos.state.nv.us/elections/voter/absentee.asp	http://sos.state.nv.us/elections/	http://sos.state.nv.us/elections/														',
	'New Hampshire		http://www.sos.nh.gov/vote.htm	http://www.sos.nh.gov/vote.htm		http://www.sos.nh.gov/electionsnew.html														',
	'New Jersey				https://voter.njsvrs.com/PublicAccess/jsp/PollPlace/PollPlaceSearch.jsp	http://www.state.nj.us/state/elections/index.html														',
	'New Mexico	https://voterview.state.nm.us/	http://www.sos.state.nm.us/sos-Questions.html	http://www.sos.state.nm.us/sos-Questions.html	https://voterview.state.nm.us/	http://www.sos.state.nm.us/sos-elections.html														',
	'New York	https://voterlookup.elections.state.ny.us/votersearch.aspx	http://www.elections.state.ny.us/Voting.html	http://www.elections.state.ny.us/Voting.html	http://gis.nyc.gov/vote/ps/index.htm	http://www.vote.nyc.ny.us/														',
	'North Carolina	http://www.sboe.state.nc.us/VoterLookup.aspx	http://www.sboe.state.nc.us/content.aspx?id=23	http://www.sboe.state.nc.us/content.aspx?id=16	http://www.sboe.state.nc.us/PrecinctFinder.aspx	http://www.sboe.state.nc.us/														',
	'North Dakota		http://www.nd.gov/sos/electvote/voting/voter-qualifi.html	http://www.nd.gov/sos/electvote/voting/voting-absentee.html		http://www.nd.gov/sos/electvote/														',
	'Ohio	http://www.sos.state.oh.us/SOS/voterquery.aspx?page=361	http://www.sos.state.oh.us/SOS/elections/voterInformation/regToVote.aspx	http://www.sos.state.oh.us/SOS/elections/voterInformation/absentee.aspx	http://www.sos.state.oh.us/SOS/pollinglocation.aspx?page=361	http://www.sos.state.oh.us/SOS/voter.aspx														',
	'Oklahoma		http://www.state.ok.us/~elections/voterreg.html	http://www.state.ok.us/~elections/absentee.html	http://www.ok.gov/elections/ppl/index.php	http://www.ok.gov/~elections/														',
	'Oregon		http://www.sos.state.or.us/elections/votreg/vreg.htm	http://www.sos.state.or.us/elections/forms/sel111.pdf		http://www.sos.state.or.us/elections/														',
	'Pennsylvania	http://www.dos.state.pa.us/voting/cwp/view.asp?a=1206&Q=446253&sureNav=|	http://www.dos.state.pa.us/voting/cwp/view.asp?a=1193&q=442991	http://www.dos.state.pa.us/voting/cwp/view.asp?a=1193&q=442991	https://www.pavoterservices.state.pa.us/Pages/PollingPlaceInfo.aspx	http://www.dos.state.pa.us/voting/														',
	'Rhode Island	http://www.sec.state.ri.us/vic/	http://www.elections.state.ri.us/registration/intro.htm	http://www.elections.state.ri.us/mailvote.htm	http://www.state.ri.us/vic/	http://www.elections.ri.gov/														',
	'South Carolina	https://webprod.cio.sc.gov/SCSECVoterWeb/voterInformationSearch.do	http://www.scvotes.org/south_carolina_voter_registration_information	http://www.state.sc.us/scsec/absent.htm		http://www.scvotes.org/														',
	'South Dakota	http://apps.sd.gov/applications/st25cers/	http://www.sdsos.gov/electionsvoteregistration/registrationvoting.shtm	http://www.sdsos.gov/electionsvoteregistration/registrationvoting.shtm#absentee	https://apps.sd.gov/applications/st25cers/	http://www.sdsos.gov/electionsvoteregistration/electionsvoteregistration_overview.shtm														',
	'Tennessee		http://www.state.tn.us/sos/election/registration.htm	http://www.state.tn.us/sos/election/bymail.htm		http://www.state.tn.us/sos/election/index.htm														',
	'Texas	https://voterinfo.sos.state.tx.us/voterws/viw/faces/Introduction.jsp	http://www.sos.state.tx.us/elections/voter/reqvr.shtml	http://www.sos.state.tx.us/elections/pamphlets/earlyvote.shtml		http://www.sos.state.tx.us/elections/index.shtml														',
	'Utah	http://gva1.utah.gov/elections/polling.aspx	http://elections.utah.gov/voterregistrationinformation.html	http://elections.utah.gov/absenteevoting.html	http://gva1.utah.gov/elections/polling.aspx	http://elections.utah.gov/														',
	'Vermont		http://vermont-elections.org/elections1/registertovote.html	http://www.vermont-elections.org/elections1/absentee.html		http://vermont-elections.org/														',
	'Virginia		http://www.sbe.virginia.gov/cms/Voter_Information/Registering_to_Vote/Index.html	http://www.sbe.virginia.gov/cms/Absentee_Voting/Index.html	https://www.voterinfo.sbe.virginia.gov/PublicSite/(A(aP4bRRCZVL9qe3b9rl3rP79KH1hIy94BDHBG9AMfLkC6xIMuUu1JioHMilqoBav7dGa2id4Dn-bu2lY8b3UOThIyYCEcdo4rPiKBd--mwB01))/Public/FT2/PublicPollingPlace.aspx?AspxAutoDetectCookieSupport=1	http://www.sbe.virginia.gov/cms/														',
	'Washington	https://wei.secstate.wa.gov/onlinevoterregistration/Registration.aspx	http://www.secstate.wa.gov/elections/register.aspx	http://www.secstate.wa.gov/elections/register_absentee.aspx	http://wei.secstate.wa.gov/OSOS/VoterVault/Pages/MyVote.aspx	http://www.secstate.wa.gov/elections/														',
	'West Virginia	http://www.wvvotes.com/voters/am-i-registered.php	http://www.wvsos.com/elections/voters/registernow.htm	http://www.wvsos.com/elections/voters/absentee.htm	http://www.wvvotes.com/voters/find-polling-place.php	http://www.wvvotes.com/														',
	'Wisconsin	http://elections.state.wi.us/category.asp?linkcatid=1773&linkid=270&locid=47				http://elections.state.wi.us/														',
	'Wyoming		http://soswy.state.wy.us/Elections/VoterReg.aspx	http://soswy.state.wy.us/Elections/Docs/Absenteevote.pdf		http://soswy.state.wy.us/Elections/Elections.aspx														'
];

stateUrlTabbed.forEach( function( tabbed ) {
	var cols = tabbed.split('\t');
	var state = statesByName[ cols[0] ];
	state.election = {
		status: cols[1],
		info: cols[2],
		absentee: cols[3],
		where: cols[4],
		elections: cols[5]
	};
});

// GAsync v2 by Michael Geary
// Commented version and description at:
// http://mg.to/2007/06/22/write-the-same-code-for-google-mapplets-and-maps-api
// Free beer and free speech license. Enjoy!

function GAsync( obj ) {
	
	function callback() {
		args[nArgs].apply( null, results );
	}
	
	function queue( iResult, name, next ) {
		
		function ready( value ) {
			results[iResult] = value;
			if( ! --nCalls )
				callback();
		}
		
		var a = [];
		if( next.join )
			a = a.concat(next), ++iArg;
		if( mapplet ) {
			a.push( ready );
			obj[ name+'Async' ].apply( obj, a );
		}
		else {
			results[iResult] = obj[name].apply( obj, a );
		}
	}
	
	//var mapplet = ! window.GBrowserIsCompatible;
	
	var args = arguments, nArgs = args.length - 1;
	var results = [], nCalls = 0;
	
	for( var iArg = 1;  iArg < nArgs;  ++iArg ) {
		var name = args[iArg];
		if( typeof name == 'object' )
			obj = name;
		else
			queue( nCalls++, name, args[iArg+1] );
	}
	
	if( ! mapplet )
		callback();
}

var userAgent = navigator.userAgent.toLowerCase(),
	msie = /msie/.test( userAgent ) && !/opera/.test( userAgent );

var localsearch = ! msie;

mapplet = window.mapplet;
var map, $jsmap, currentAddress;
var home, vote;

var key = {
	'gigapad': 'ABQIAAAAgNQJhbWKFHRJJiHCXotPZxTCDaeoAnk9GZSdGi854AcXbJXoXRS9QqxqDWHL54Twi5thIIANaCUAeA',
	'gigapad.local': 'ABQIAAAAgNQJhbWKFHRJJiHCXotPZxTM3oEyKJfFfMe3pRkahPyHmmHL_xSjOVWnaIMs0gtUrFuoOJzsQiPnKA',
	'maps.gmodules.com': 'ABQIAAAAL7MXzZBubnPtVtBszDCxeRTqV_PyyxRizIwUkTfU6T-V7M7btRRpOM29SpcTDh2dojFpfRwpoTTMWw',
	'mg.to': 'ABQIAAAAL7MXzZBubnPtVtBszDCxeRQjDwyFD3YNj60GgWGUlJCU_q5i9hSSSzj0ergKKMY55eRpMa05FE3Wog',
	'padlet': 'ABQIAAAAL7MXzZBubnPtVtBszDCxeRSuIOvo2pGs7VouOPMgaUBd9TDiaBTE5gjPTrifBPED7VUFoeKD_Ysmkw',
	'padlet.local': 'ABQIAAAAgNQJhbWKFHRJJiHCXotPZxTbToHSggDWprRoD6gaXq5geEyxiBTRRmW6BwPHdCzJ2mh90uajjkpAOA',
	's.mg.to': 'ABQIAAAAL7MXzZBubnPtVtBszDCxeRQ9jbX8zKuYy1oz9F5p7GBNeAnoJRS9Itc8RizuhplTF59tia4NLgrdHQ',
	'': ''
}[location.host];

document.write(
	'<script type="text/javascript" src="http://www.google.com/jsapi">',
	'</script>'
);

document.write(
	'<style type="text/css">',
		'body.gadget { margin:0; padding:0; }',
		'#wrapper, #wrapper * { font-family:Arial,sans-serif; font-size:10pt; }',
		//'#spinner { z-index: 1; position:absolute; width:100%; height:100%; background-image:url(', baseUrl, 'spinner.gif); background-position:center; background-repeat:no-repeat; opacity:0.30; -moz-opacity:0.30; }',
		'#spinner { filter:alpha(opacity=30); }',
		'#title { margin-bottom:4px; }',
		'#title, #mapbox { overflow: auto; }',
		'.heading { font-weight:bold; font-size:110%; }',
		'.orange { padding:6px; width:95%; background-color:#FFEAC0; border:1px solid #FFBA90; }',
		'.pink { padding:6px; width:95%; background-color:#FFD0D0; border:1px solid #FF9090; }',
	'</style>'
);

if( mapplet ) {
	document.write(
		'<style type="text/css">',
			'#PollingPlaceSearch, #PollingPlaceSearch td { font-size:10pt; margin:0; padding:0; }',
			'#PollingPlaceSearch { background-color:#EEE; border:1px solid #AAA; margin:0; padding:6px; width:95%; }',
			'.PollingPlaceSearchForm { margin:0; padding:0; }',
			'.PollingPlaceSearchTitle { /*font-weight:bold;*/ /*font-size:110%;*/ /*padding-bottom:4px;*/ }',
			//'/*.PollingPlaceSearchSpinner { float:right; margin-right:4px; width:16px; height:16px; background-image:url(spinner16.gif); background-position:1000px 0px; background-repeat:no-repeat; }*/',
			//'.PollingPlaceSearchLabelBox { position:relative; float:left; margin-right:6px; }',
			'.PollingPlaceSearchInput { width:100%; }',
			'#title { margin-top:12px; }',
		'</style>'
	);
}

if( mapplet ) {
	document.write(
		'<div id="outerlimits" style="margin-right:8px;">'
	);
}

if( mapplet ) {
	document.write(
		'<div id="PollingPlaceSearch">',
			'<div class="PollingPlaceSearchTitle removehelp">',
				'<div style="margin-bottom:4px;">',
					'Find your voting location, registration information and more. ',
					'Enter your <strong>home</strong>&nbsp;address:',
				'</div>',
			'</div>',
			'<!--<div id="PollingPlaceSearchSpinner" class="PollingPlaceSearchSpinner">-->',
			'<!--</div>-->',
			'<div>',
				'<form id="PollingPlaceSearchForm" class="PollingPlaceSearchForm" onsubmit="return PollingPlaceSearch.submit()">',
					'<table style="width:100%;">',
						'<tr>',
							'<td style="width:99%;">',
								'<div>',
									'<input id="PollingPlaceSearchInput" class="PollingPlaceSearchInput" type="text" value="',
										htmlEscape( ( params.home || '' ).replace( /!/g, ' ' ) ),
									'" />',
								'</div>',
							'</td>',
							'<td style="width:1%;">',
								'<div>',
									'<button type="submit" id="PollingPlaceSearchButton" class="PollingPlaceSearchButton"> Search</button>',
								'</div>',
							'</td>',
						'</tr>',
					'</table>',
				'</form>',
			'</div>',
			'<div class="removehelp">',
				'<div style="margin-top:0.25em;">',
					'Example: ',
					'<a href="#" onclick="return PollingPlaceSearch.sample();">',
						sampleAddr,
					'</a>',
				'</div>',
			'</div>',
		'</div>'
	);
}
else {
	document.write(
		'<script type="text/javascript" src="http://maps.google.com/maps?file=api&amp;v=2&amp;key=', key, '">',
		'<\/script>'
	);
	if( localsearch )
		document.write(
			'<script type="text/javascript" src="http://www.google.com/uds/api?file=uds.js&v=1.0&key=', key, '">',
			'<\/script>',
			'<script type="text/javascript" src="http://www.google.com/uds/solutions/localsearch/gmlocalsearch.js">',
			'<\/script>',
			'<style type="text/css">',
				'@import url("http://www.google.com/uds/css/gsearch.css");',
				'@import url("http://www.google.com/uds/solutions/localsearch/gmlocalsearch.css");',
		   '</style>'
		);
}

var available = S(
	'<div class="orange">',
		'<div>',
			'Voter registration information is available for all states.',
		'</div>',
		'<div style="margin-top:0.5em;">',
			'Voting locations will be available by mid-October.',
		'</div>',
	'</div>'
);

var locationWarning = S(
	'<div style="padding-top:1em; xline-height:1.2em; xcolor:gray; xfont-size:80%;">',
		'<span style="color:red; font-weight:bold;">',
			'Important&nbsp; ',
		'</span>',
		'To ensure that this voting location is correct, please verify it with your local election officials.',
	'</div>'
);

var interpolatedLocationWarning = S(
	'<div style="padding-top:1em; xline-height:1.2em; xcolor:gray; xfont-size:80%;">',
		'<span style="color:red; font-weight:bold;">',
			'Important&nbsp; ',
		'</span>',
		'Verify your voting location with your local election officials. ',
		'This location is an estimate. ',
		'It may be incorrect and may change before election day.',
	'</div>'
);

writeBody = function() {
	document.write(
		'<div id="spinner">',
		'</div>',
		'<div id="wrapper">',
			'<div id="title">',
			'</div>',
			'<div id="mapbox">',
				available,
			'</div>',
		'</div>'
	);
};

if( mapplet )
	writeBody();

if( mapplet ) {
	document.write(
		'</div>'
	);
}

$(function() {

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

function url( base, params, delim ) {
	var a = [];
	for( var p in params ) {
		var v = params[p];
		if( v != null ) a[a.length] = [ p, v ].join('=');
	}
	return a.length ? [ base, a.sort().join('&') ].join( delim || '?' ) : base;
}

function linkto( addr ) {
	var a = htmlEscape( addr ), u = a;
	if( addr.match(/@/) )
		u = 'mailto:' + u;
	else if( ! addr.match(/^http:\/\//) )
		u = a = 'http://' + a;
	return S( '<a target="_blank" href="', u, '">', a, '</a>' );
}

function expander( link, body ) {
	return S(
		'<div>',
			'<div>',
				'<a href="#" onclick="return expandit(this);">',
					link,
				'</a>',
			'</div>',
			'<div style="display:none; margin:8px;">',
				body,
			'</div>',
		'</div>'
	);
}

expandit = function( node ) {
	 $(node).parent().next().slideDown('slow');
	 return false;
}

function electionInfo( a ) {
	a = a || {};
	var state = home.info.state;
	if( ! state  ||  ! state.election ) return '';
	
	var estimate = a.estimate ? expander(
		S(
			'<div style="margin-top:0.5em; font-size:90%;">',
				'Not your home state?',
			'</div>'
		),
		S(
			'<div class="pink">',
				'<div>',
					'Sorry we got your location wrong!',
				'</div>',
				'<div style="margin-top:0.5em;">',
					'It was our best guess based on your computer\'s ',
					'<a target="_blank" href="http://www.google.com/search?q=ip+address">',
						'IP address',
					'</a>',
				'</div>',
				'<div style="margin-top:0.5em;">',
					'Enter your home address in the box above and click Search for more accurate information.',
				'</div>',
			'</div>'
		)
	) : '';
	return S(
		'<div>',
			'<div class="heading" style="margin-bottom:4px;">',
				fix('%S Voter Info'),
			'</div>',
			election( 'status', 'Are you registered to vote?' ),
			election( 'info', 'How to register in %S', true ),
			election( 'absentee', 'Get an absentee ballot' ),
			election( 'elections', '%S election website' ),
			estimate,
			local(),
		'</div>'
	);
	
	function fix( text, prefix ) {
		return( text
			.replace( '%S', S(
				prefix && state.prefix ? state.prefix  + ' ' : '',
				state.name
			) )
			//.replace( '%C', S(
			//	home.info.county // TODO?
			//) )
		);
	}
	
	function election( key, text, prefix ) {
		var url = state.election[key];
		return ! url ? '' : S(
			'<div>',
				'<a target="_blank" href="', url, '">',
					fix( text, prefix ),
				'</a>',
			'</div>'
		);
	}
	
	function local() {
		var leo = home.leo;
		if( !( leo.title || leo.phone || leo.email  ) ) return '';
		function remove( what ) {
			if( title.indexOf(what) == 0 )
				title = title.slice( what.length + 1 );
		}
		var county = home.info.countyName;
		var title = leo.title;
		remove( county );
		remove( 'County' );
		return S(
			'<div style="padding-top:0.5em;">',
				'<div class="heading" style="padding-bottom:4px">',
					county, ' County ',
					title || ' Voter Info',
				'</div>',
				leo.phone ? S( '<div>', 'Phone: ', leo.phone, '</div>' ) : '',
				leo.email ? S( '<div>', 'Email: ', linkto(leo.email), '</div>' ) : '',
			'</div>'
		);
	}
}

function setVoteHtml() {
	if( ! vote.info ) return;
	//var largeMapLink = mapplet ? '' : S(
	//	'<div style="padding-top:0.5em;">',
	//		'<a target="_blank" href="http://maps.google.com/maps?f=q&hl=en&geocode=&q=', encodeURIComponent( a.address.replace( / /g, '+' ) ), '&ie=UTF8&ll=', latlng, '&z=15&iwloc=addr">',
	//			'Large map and directions &#187;',
	//		'</a>',
	//	'</div>'
	//);
	var extra = S(
		'<div>',
			'<a target="_blank" href="http://maps.google.com/maps?f=d&saddr=', encodeURIComponent(home.info.address), '&daddr=', encodeURIComponent(vote.info.address), '&hl=en&mra=ls&ie=UTF8&iwloc=A&iwstate1=dir">',
				'Get directions',
			'</a>',
			//' - ',
			//'<a xtarget="_blank" href="http://maps.google.com/maps?f=q&hl=en&geocode=&q=polling+places+loc+', encodeURIComponent( a.address.replace( / /g, '+' ) ), '&ie=UTF8&z=15&iwloc=A&iwstate1=stp">',
			//	'Send',
			//'</a>',
		'</div>'
	);
	var location = formatLocation( vote.info, 'vote-icon-50.png', 'Your Voting Location', extra );
	if( mapplet ) $title.append( S(
		'<div>',
			electionInfo(),
			'<div style="padding-top:1em">',
			'</div>',
			formatHome(),
			'<div style="padding-top:0.75em">',
			'</div>',
			location,
			locationWarning,
		'</div>'
	));
	vote.html = S(
		'<div style="font-family:Arial,sans-serif; font-size:10pt;">',
			location,
			locationWarning,
		'</div>'
	);
}

function initMap( a ) {
	setVoteHtml();
	
	function ready() {
		setTimeout( function() {
			var only = ! vote.info;
			setMarker({
				place: home,
				image: baseUrl + 'marker-green.png',
				open: only,
				html: formatHome( true/*only*/ )
			});
			if( vote.info )
				setMarker({
					place: vote,
					html: vote.html,
					open: true
				});
		}, 500 );
	}
	
	function setMarker( a ) {
		var icon = new GIcon( G_DEFAULT_ICON );
		if( a.image ) icon.image = cacheUrl( a.image );
		var marker = a.place.marker =
			new GMarker( a.place.info.latlng, { icon:icon });
		map.addOverlay( marker );
		var options = {
			maxWidth: mapplet ? 325 : Math.min( $jsmap.width() - 150, 325 )
			/*, disableGoogleLinks:true*/
		};
		marker.bindInfoWindow( $(a.html)[0], options );
		if( a.open ) marker.openInfoWindowHtml( a.html, options );
	}
	
	if( ! mapplet )
		GEvent.addListener( map, 'load', ready );
	
	// Initial position with marker centered on home, or halfway between home and voting place
	var hi = home.info, vi = vote.info;
	if( ! hi ) return;
	var latlng = hi.latlng;
	if( vi ) {
		latlng = new GLatLng(
			( hi.lat + vi.lat ) / 2,
			( hi.lng + vi.lng ) / 2
		);
	}
	//var center = latlng;
	//var width = $jsmap.width(), height = $jsmap.height();
	map.setCenter( latlng, a.zoom );
	if( ! mapplet ) {
		// Move map down a bit
		//var point = map.fromLatLngToDivPixel( latlng );
		//point = new GPoint(
		//	point.x /*- width * .075*/,
		//	point.y - height * .275
		//);
		//map.setCenter( map.fromDivPixelToLatLng(point), a.zoom );
		map.addControl( new GSmallMapControl );
		map.addControl( new GMapTypeControl );
		if( localsearch ) {
			//alert( window.GControl );
			//debugger;
			//map.addControl(
			//	new google.maps.LocalSearch(),
			//	new GControlPosition( G_ANCHOR_BOTTOM_RIGHT, new GSize(10,20) )
			//);
			var gls = new google.maps.LocalSearch();
			var gs = new GSize(10,20);
			var gcp = new GControlPosition( G_ANCHOR_BOTTOM_RIGHT, gs )
			map.addControl( gls, gcp );
		}
	}
	if( mapplet )
		ready();
	spin( false );
}

function formatLocation( info, icon, title, extra ) {
	return S(
		'<div style="font-weight:bold; font-size:110%;">',
			title,
		'</div>',
		'<div style="padding-top:0.5em;">',
			'<table cellpadding="0" cellspacing="0">',
				'<tr valign="middle">',
					'<td style="width:50px; padding-right:.75em;">',
						'<img src="', cacheUrl( baseUrl + icon ), '" style="width:50px; height:50px;" />',
					'</td>',
					'<td>',
						'<div>',
							info.street,
						'</div>',
						'<div>',
							info.city, ', ', info.state.abbr, ' ', info.zip,
						'</div>',
						extra,
					'</td>',
				'</tr>',
			'</table>',
		'</div>'
	);
}

function spin( yes ) {
	//console.log( 'spin', yes );
	$('#spinner').css({ visibility: yes ? 'visible' : 'hidden' });
}

function geocode( address, callback ) {
	var url = S(
		'http://maps.google.com/maps/geo?output=json&oe=utf-8&q=',
		encodeURIComponent(address), '&key=', key
	);
	getJSON( url, callback );
}

function getleo( info, callback ) {
	var url = S( dataUrl, 'leo/', info.state.abbr, '.xml' );
	if( mapplet ) {
		_IG_FetchXmlContent( url, function( xml ) {
			if( typeof xml == 'string' ) {
				callback({});
				return;
			}
			function add( key ) { leo[key] = $.trim( $leo.find(key).text() ); }
			var name = info.countyName.toUpperCase();
			var counties = xml.getElementsByTagName( 'county_name' );
			for( var i = 0, county;  county = counties[i++]; ) {
				if( county.firstChild.nodeValue == name ) {
					var $leo = $(county.parentNode);
					var leo = {};
					add('name'), add('title'), add('phone'), add('fax'), add('email');
					callback( leo );
					return;
				}
			}
			callback({});
		});
	}
	else {
		callback({});
	}
}

function lookup( address, callback ) {
	if( mapplet )
		var url = S(
			'http://pollinglocation.apis.google.com/?q=',
			encodeURIComponent(address)
		);
	else
		var url = S( 'http://s.mg.to/elections/proxy.php?q=', encodeURIComponent(address) );
	
	getJSON( url, callback );
}

function getJSON( url, callback ) {
	if( mapplet ) {
		_IG_FetchContent( url, function( text ) {
			var json = eval( '(' + text + ')' );
			callback( json );
		});
	}
	else {
		$.getJSON( url + '&callback=?', callback );
	}
}

function closehelp( callback ) {
	var $remove = $('.removehelp');
	if( $.browser.msie  ||  $remove.css('display') == 'none' ) {
		callback();
	}
	else {
		var count = $remove.length;
		$remove.slideUp( 350, function() {
			if( --count == 0 ) callback();
		});
	}
}

function submit( addr, estimate ) {
	home = {};
	vote = {};
	map && map.clearOverlays();
	currentAddress = addr;
	$title.empty();
	$map.empty();
	closehelp( function() {
		geocode( addr, function( geo ) {
			var places = geo && geo.Placemark;
			var n = places && places.length;
			if( n == 0 ) {
				spin( false );
				$title.html( 'No match for that address.' );
			}
			else if( n == 1 ) {
				findPrecinct( places[0] );
			}
			else {
				if( places ) {
					$title.append( S(
						'<div id="radios" style="padding-top:0.5em;">',
							'<strong>Select your address:</strong>',
						'</div>'
					));
					var $radios = $('#radios');
					$radios.append( formatPlaces(places) );
					$('input:radio',$title).click( function() {
						var radio = this;
						spin( true );
						setTimeout( function() {
							function ready() {
								findPrecinct( places[ radio.id.split('-')[1] ] );
							}
							if( $.browser.msie ) ready();
							else $('#radios').slideUp( 350, ready );
						}, 250 );
					});
				}
				else {
					$title.append( sorryHtml() );
				}
			}
		});
	});
}

function formatHome( extra ) {
	return S(
		'<div style="font-family:Arial,sans-serif; font-size:10pt;">',
			formatLocation( home.info, 'home-icon-50.png', 'Your Home' ),
			//extra ? electionInfo() : '',
		'</div>'
	);
}

function findPrecinct( place ) {
	home.info = mapInfo( place );
	if( ! home.info ) { $title.empty(); sorry(); return; }
	var address = currentAddress = place.address;
	
	getleo( home.info, function( leo ) {
		home.leo = leo;
		lookup( address, function( poll ) {
			if( poll.errorcode != 0 ) sorry();
			else geocode( poll.address[0] || poll.locations[0].address, function( geo ) {  // TEMP FORMAT CHANGE
				var places = geo && geo.Placemark;
				if( ! places  ||  places.length != 1 ) sorry();
				else setMap( vote.info = mapInfo(places[0]) );
			});
		});
	});
}

function sorry() {
	$map.html( sorryHtml() );
	if( mapplet ) setMap( home.info );
	spin( false );
}

function sorryHtml() {
	return S(
		'<div>',
			home.info ? electionInfo() : '',
			'<div class="orange" style="margin-top:1em;">',
				'<div>',
					'Sorry, we did not find your voting place.',
				'</div>',
				'<div style="padding-top:0.5em;">',
					'We are working to provide this data soon. Please check with your state or local election officials to verify your voting location.',
				'</div>',
			'</div>',
		'</div>'
	);
}

function setMap( a ) {
	if( ! mapplet ) {
		a.width = $map.width();
		$map.height( a.height = $window.height() - $map.offset().top );
		$map.html( formatMap(a) );
	}
	initMap( a );
}

function formatAddress( address ) {
	return htmlEscape( ( address || '' ).replace( /, USA$/, '' ) );
}

function formatPlaces( places ) {
	if( ! places ) return sorryHtml();
	
	var checked = '';
	if( places.length == 1 ) checked = 'checked="checked" ';
	else spin( false );
	var list = places.map( function( place, i ) {
		var id = 'PollingPlaceSearchPlaceRadio-' + i;
		place.extra = { index:i, id:id };
		return S(
			'<tr class="PollingPlaceSearchPlace" style="vertical-align:top;">',
				'<td style="width:1%; padding:2px 0;">',
					'<input type="radio" ', checked, 'name="PollingPlaceSearchPlaceRadio" class="PollingPlaceSearchPlaceRadio" id="', id, '" />',
				'</td>',
				'<td style="width:99%; padding:5px 0 2px 2px;">',
					'<div>',
						'<label for="', id, '" class="PollingPlaceSearchPlaceAddress">',
							formatAddress(place.address),
						'</label>',
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

function mapInfo( place ) {
	var area = place.AddressDetails.Country.AdministrativeArea;
	if( ! area ) return null;
	var state = stateByAbbr( area.AdministrativeAreaName );
	if( ! state ) return null;
	var sub = area.SubAdministrativeArea || area;
	var locality = sub.Locality;
	if( ! locality ) return null;
	var countyName = sub.SubAdministrativeAreaName || locality.LocalityName;
	var street = locality.Thoroughfare;
	var zip = locality.PostalCode;
	var coord = place.Point.coordinates;
	var lat = coord[1], lng = coord[0];
	return {
		address: formatAddress(place.address),
		lat: lat,
		lng: lng,
		latlng: new GLatLng( lat, lng ),
		street: street && street.ThoroughfareName || '',
		city: locality.LocalityName,
		countyName: countyName,
		state: state,
		zip: zip && zip.PostalCodeNumber || '',
		zoom: 15,
		_:''
	};
}

function formatMap( a ) {
	return S(
		'<div id="jsmap" style="width:', a.width, 'px; height:', a.height, 'px;">',
		'</div>'
	);
}

var $window = $(window), $title = $('#title'), $map = $('#mapbox'), $spinner = $('#spinner');

(function() {
	var loc = google.loader && google.loader.ClientLocation;
	if( ! loc ) return;
	var address = loc && loc.address;
	if( ! address  ||  address.country != 'USA' ) return;
	var state = stateByAbbr( address.region );
	if( ! state ) return;
	home = { info:{ state:state }, leo:{} };
	$title.append(S(
		'<div class="orange" style="margin-bottom:6px;">',
			electionInfo({ estimate:true }),
		'</div>'
	));
	
	if( mapplet ) {
		map = new GMap2;
		zoom();
	}
	else {
		GBrowserIsCompatible() && setTimeout( function() {
			$jsmap = $('#jsmap');
			var map = new GMap2( $jsmap[0], {
				mapTypes: [
					G_NORMAL_MAP,
					G_SATELLITE_MAP,
					G_SATELLITE_3D_MAP
				]
			});
			zoom();
		}, 1 );
	}
	
	function zoom() {
		var bounds = state.bounds;
		bounds = new GLatLngBounds(
			new GLatLng( bounds[0][1], bounds[0][0] ),
			new GLatLng( bounds[1][1], bounds[1][0] )
		);
		GAsync( map, 'getBoundsZoomLevel', [ bounds ], function( zoom ) {
			map.setCenter( bounds.getCenter(), zoom );
		});
	}
})();

if( mapplet ) {
	(function() {
		function e( id ) { return document.getElementById('PollingPlaceSearch'+id); }
		var /*spinner = e('Spinner'),*/ /*label = e('Label'),*/ input = e('Input'), button = e('Button');
		button.disabled = false;
		
		window.PollingPlaceSearch = {
			
			focus: function() {
				//label.style.textIndent = '-1000px';
			},
			
			blur: function() {
				//if( input.value === '' )
				//	label.style.textIndent = '0px';
			},
			
			sample: function() {
				input.value = sampleAddr;
				this.submit();
				return false;
			},
			
			submit: function() {
				//spinner.style.backgroundPosition = '0px 0px';
				submit( input.value );
				return false;
			}
		};
		
		PollingPlaceSearch.focus();
		PollingPlaceSearch.blur();
		if( params.home ) PollingPlaceSearch.submit();
	})();
}
else {
	submit( decodeURIComponent( location.hash.slice(1) ) );
}

});
