var baseUrl = mapplet && mapplet.baseUrl || 'http://poll411.s3.amazonaws.com/';

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
};

function htmlEscape( str ) {
	var div = document.createElement( 'div' );
	div.appendChild( document.createTextNode( str ) );
	return div.innerHTML;
}

var states = [
	{
		'abbr': 'AL',
		'name': 'Alabama',
		'tall': true,
		'parties': {
			'dem': { 'date': '02-05' },
			'gop': { 'date': '02-05' }
		}
	},
	{
		'abbr': 'AK',
		'name': 'Alaska',
		'parties': {
			'dem': { 'date': '02-05', 'type': 'caucus' },
			'gop': { 'date': '02-05', 'type': 'caucus' }
		}
	},
	{
		'abbr': 'AZ',
		'name': 'Arizona',
		'tall': true,
		'parties': {
			'dem': { 'date': '02-05' },
			'gop': { 'date': '02-05' }
		}
	},
	{
		'abbr': 'AR',
		'name': 'Arkansas',
		'tall': true,
		'parties': {
			'dem': { 'date': '02-05' },
			'gop': { 'date': '02-05' }
		}
	},
	{
		'abbr': 'CA',
		'name': 'California',
		'tall': true,
		'parties': {
			'dem': { 'date': '02-05' },
			'gop': { 'date': '02-05' }
		}
	},
	{
		'abbr': 'CO',
		'name': 'Colorado',
		'parties': {
			'dem': { 'date': '02-05', 'type': 'caucus' },
			'gop': { 'date': '02-05', 'type': 'caucus' }
		}
	},
	{
		'abbr': 'CT',
		'name': 'Connecticut',
		'votesby': 'town',
		'parties': {
			'dem': { 'date': '02-05' },
			'gop': { 'date': '02-05' }
		}
	},
	{
		'abbr': 'DE',
		'name': 'Delaware',
		'tall': true,
		'parties': {
			'dem': { 'date': '02-05' },
			'gop': { 'date': '02-05' }
		}
	},
	{
		'abbr': 'DC',
		'name': 'District of Columbia',
		'parties': {
			'dem': { 'date': '02-12' },
			'gop': { 'date': '02-12' }
		}
	},
	{
		'abbr': 'FL',
		'name': 'Florida',
		'parties': {
			'dem': { 'date': '01-29' },
			'gop': { 'date': '01-29' }
		}
	},
	{
		'abbr': 'GA',
		'name': 'Georgia',
		'tall': true,
		'parties': {
			'dem': { 'date': '02-05' },
			'gop': { 'date': '02-05' }
		}
	},
	{
		'abbr': 'HI',
		'name': 'Hawaii',
		'parties': {
			'dem': { 'date': '02-19', 'type': 'caucus' },
			'gop': { 'date': '01-25', 'type': 'caucus' }
		}
	},
	{
		'abbr': 'ID',
		'name': 'Idaho',
		'tall': true,
		'parties': {
			'dem': { 'date': '02-05', 'type': 'caucus' },
			'gop': { 'date': '05-27' }
		}
	},
	{
		'abbr': 'IL',
		'name': 'Illinois',
		'tall': true,
		'parties': {
			'dem': { 'date': '02-05' },
			'gop': { 'date': '02-05' }
		}
	},
	{
		'abbr': 'IN',
		'name': 'Indiana',
		'tall': true,
		'parties': {
			'dem': { 'date': '05-06' },
			'gop': { 'date': '05-06' }
		}
	},
	{
		'abbr': 'IA',
		'name': 'Iowa',
		'parties': {
			'dem': { 'date': '01-03', 'type': 'caucus' },
			'gop': { 'date': '01-03', 'type': 'caucus' }
		}
	},
	{
		'abbr': 'KS',
		'name': 'Kansas',
		'votesby': 'district',
		'parties': {
			'dem': { 'date': '02-05', 'type': 'caucus' },
			'gop': { 'date': '02-09', 'type': 'caucus' }
		}
	},
	{
		'abbr': 'KY',
		'name': 'Kentucky',
		'parties': {
			'dem': { 'date': '05-20' },
			'gop': { 'date': '05-20' }
		}
	},
	{
		'abbr': 'LA',
		'name': 'Louisiana',
		'parties': {
			'dem': { 'date': '02-09' },
			'gop': { 'date': '01-22', 'type': 'caucus' }
		}
	},
	{
		'abbr': 'ME',
		'name': 'Maine',
		'tall': true,
		'parties': {
			'dem': { 'date': '02-10', 'type': 'caucus' },
			'gop': { 'date': '02-01', 'type': 'caucus' }
		}
	},
	{
		'abbr': 'MD',
		'name': 'Maryland',
		'parties': {
			'dem': { 'date': '02-12' },
			'gop': { 'date': '02-12' }
		}
	},
	{
		'abbr': 'MA',
		'name': 'Massachusetts',
		'votesby': 'town',
		'parties': {
			'dem': { 'date': '02-05' },
			'gop': { 'date': '02-05' }
		}
	},
	{
		'abbr': 'MI',
		'name': 'Michigan',
		'tall': true,
		'parties': {
			'dem': { 'date': '01-15' },
			'gop': { 'date': '01-15' }
		}
	},
	{
		'abbr': 'MN',
		'name': 'Minnesota',
		'tall': true,
		'parties': {
			'dem': { 'date': '02-05', 'type': 'caucus' },
			'gop': { 'date': '02-05', 'type': 'caucus' }
		}
	},
	{
		'abbr': 'MS',
		'name': 'Mississippi',
		'tall': true,
		'parties': {
			'dem': { 'date': '03-11' },
			'gop': { 'date': '03-11' }
		}
	},
	{
		'abbr': 'MO',
		'name': 'Missouri',
		'parties': {
			'dem': { 'date': '02-05' },
			'gop': { 'date': '02-05' }
		}
	},
	{
		'abbr': 'MT',
		'name': 'Montana',
		'parties': {
			'dem': { 'date': '06-03' },
			'gop': { 'date': '02-05', 'type': 'caucus' }
		}
	},
	{
		'abbr': 'NE',
		'name': 'Nebraska',
		'votesby': 'district',
		'parties': {
			'dem': { 'date': '02-09', 'type': 'caucus' },
			'gop': { 'date': '05-13' }
		}
	},
	{
		'abbr': 'NV',
		'name': 'Nevada',
		'tall': true,
		'parties': {
			'dem': { 'date': '01-19', 'type': 'caucus' },
			'gop': { 'date': '01-19', 'type': 'caucus' }
		}
	},
	{
		'abbr': 'NH',
		'name': 'New Hampshire',
		'tall': true,
		'votesby': 'town',
		'parties': {
			'dem': { 'date': '01-08' },
			'gop': { 'date': '01-08' }
		}
	},
	{
		'abbr': 'NJ',
		'name': 'New Jersey',
		'tall': true,
		'parties': {
			'dem': { 'date': '02-05' },
			'gop': { 'date': '02-05' }
		}
	},
	{
		'abbr': 'NM',
		'name': 'New Mexico',
		'tall': true,
		'parties': {
			'dem': { 'date': '02-05', 'type': 'caucus', 'votesby': 'district' },
			'gop': { 'date': '06-03', 'shape': 'county' }
		}
	},
	{
		'abbr': 'NY',
		'name': 'New York',
		'parties': {
			'dem': { 'date': '02-05' },
			'gop': { 'date': '02-05' }
		}
	},
	{
		'abbr': 'NC',
		'name': 'North Carolina',
		'parties': {
			'dem': { 'date': '05-06' },
			'gop': { 'date': '05-06' }
		}
	},
	{
		'abbr': 'ND',
		'name': 'North Dakota',
		'parties': {
			'dem': { 'date': '02-05', 'type': 'caucus' },
			'gop': { 'date': '02-05', 'type': 'caucus' }
		}
	},
	{
		'abbr': 'OH',
		'name': 'Ohio',
		'parties': {
			'dem': { 'date': '03-04' },
			'gop': { 'date': '03-04' }
		}
	},
	{
		'abbr': 'OK',
		'name': 'Oklahoma',
		'parties': {
			'dem': { 'date': '02-05' },
			'gop': { 'date': '02-05' }
		}
	},
	{
		'abbr': 'OR',
		'name': 'Oregon',
		'parties': {
			'dem': { 'date': '05-20' },
			'gop': { 'date': '05-20' }
		}
	},
	{
		'abbr': 'PA',
		'name': 'Pennsylvania',
		'parties': {
			'dem': { 'date': '04-22' },
			'gop': { 'date': '04-22' }
		}
	},
	{
		'abbr': 'PR',
		'name': 'Puerto Rico',
		'parties': {
			'dem': { 'date': '06-01' },
			//'gop': { 'date': '02-24' }
			'gop': { 'date': 'n/a' }
		}
	},
	{
		'abbr': 'RI',
		'name': 'Rhode Island',
		'tall': true,
		'parties': {
			'dem': { 'date': '03-04' },
			'gop': { 'date': '03-04' }
		}
	},
	{
		'abbr': 'SC',
		'name': 'South Carolina',
		'parties': {
			'dem': { 'date': '01-26' },
			'gop': { 'date': '01-19' }
		}
	},
	{
		'abbr': 'SD',
		'name': 'South Dakota',
		'parties': {
			'dem': { 'date': '06-03' },
			'gop': { 'date': '06-03' }
		}
	},
	{
		'abbr': 'TN',
		'name': 'Tennessee',
		'parties': {
			'dem': { 'date': '02-05' },
			'gop': { 'date': '02-05' }
		}
	},
	{
		'abbr': 'TX',
		'name': 'Texas',
		'parties': {
			'dem': { 'date': '03-04' },
			'gop': { 'date': '03-04' }
		}
	},
	{
		'abbr': 'UT',
		'name': 'Utah',
		'tall': true,
		'parties': {
			'dem': { 'date': '02-05' },
			'gop': { 'date': '02-05' }
		}
	},
	{
		'abbr': 'VT',
		'name': 'Vermont',
		'tall': true,
		'votesby': 'town',
		'parties': {
			'dem': { 'date': '03-04' },
			'gop': { 'date': '03-04' }
		}
	},
	{
		'abbr': 'VA',
		'name': 'Virginia',
		'parties': {
			'dem': { 'date': '02-12' },
			'gop': { 'date': '02-12' }
		}
	},
	{
		'abbr': 'WA',
		'name': 'Washington',
		'parties': {
			'dem': { 'date': '02-09', 'type': 'caucus' },
			'gop': { 'date': '02-09', 'type': 'caucus' }
		}
	},
	{
		'abbr': 'WV',
		'name': 'West Virginia',
		'parties': {
			'dem': { 'date': '05-13' },
			'gop': { 'date': '05-13' }
		}
	},
	{
		'abbr': 'WI',
		'name': 'Wisconsin',
		'tall': true,
		'parties': {
			'dem': { 'date': '02-19' },
			'gop': { 'date': '02-19' }
		}
	},
	{
		'abbr': 'WY',
		'name': 'Wyoming',
		'parties': {
			'dem': { 'date': '03-08', 'type': 'caucus' },
			'gop': { 'date': '01-05', 'type': 'caucus' }
		}
	}
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

var stateUrlTabbed = [
	'Alabama		http://www.sos.state.al.us/Elections/VoterRegistrationInfo.aspx	http://www.sos.state.al.us/Elections/AbsenteeVotingInfo.aspx		http://www.sos.state.al.us/Elections/Default.aspx														',
	'Alaska		http://ltgov.state.ak.us/elections/regapp.php	http://www.elections.alaska.gov/abinfo.php		http://www.elections.alaska.gov/														',
	'Arizona	https://servicearizona.com/webapp/evoter/select_language.do	http://www.azsos.gov/election/How_to_register.htm	http://www.azsos.gov/election/Military.htm		http://www.azsos.gov/election/														',
	'Arkansas	https://www.voterview.ar-nova.org/	http://www.votenaturally.org/all_about_voting.html	http://www.votenaturally.org/all_about_voting_absentee.html	https://www.voterview.ar-nova.org/	http://www.sos.arkansas.gov/elections.html														',
	'California		http://www.sos.ca.gov/elections/elections_vr.htm	http://www.sos.ca.gov/elections/elections_mov.htm		http://www.sos.ca.gov/elections/elections.htm														',
	'Colorado	http://www.sos.state.co.us/Voter/voterHome.do;jsessionid=0000QlBp7qrdd1E9ysKzDFyDdlc:121vl9gps	http://www.elections.colorado.gov/WWW/default/Clerks%20Corner/SOS%20Approved%20Forms/2008_forms/approved_registration_form_37_combo_VR_application_english_color_06.26.08.pdf	http://www.elections.colorado.gov/WWW/default/Clerks%20Corner/SOS%20Approved%20Forms/2008_forms/approved_mail-in_ballot_form_17_mail-in_ballot_application_english_color_06.17.08.pdf		http://www.elections.colorado.gov														',
	'Connecticut		http://www.ct.gov/sots/LIB/sots/ElectionServices/ElectForms/electforms/ed671.pdf	http://www.ct.gov/sots/LIB/sots/ElectionServices/ElectForms/electforms/aabeng.pdf		http://www.ct.gov/sots/cwp/view.asp?a=3179&q=392220&SOTSNav_GID=1846														',
	'Delaware	http://pollingplace.delaware.gov/	https://registertovote.elections.delaware.gov/VoterRegistration/TermsAgreement	http://electionsncc.delaware.gov/absentee_de/index.shtml	http://pollingplace.delaware.gov/	http://elections.delaware.gov/														',
	'District of Columbia	http://www.dcboee.org/voterreg/vic_step1.asp	http://www.dcboee.org/serv/download_index.shtm	http://www.dcboee.org/serv/download_index.shtm	http://www.dcboee.org/voterreg/ppl_step1.asp	http://www.dcboee.org/														',
	'Florida		http://election.dos.state.fl.us/regtovote/regform.shtml	http://election.dos.state.fl.us/absenteevoting.shtml		http://election.dos.state.fl.us/														',
	'Georgia	http://sos.georgia.gov/cgi-bin/llocator3a.asp?	http://www.sos.georgia.gov/elections/Voting_information.htm#Registering%20to%20Vote	http://www.sos.georgia.gov/elections/Voting_information.htm#Absentee_Voting	http://sos.georgia.gov/elections/polllocator/	http://sos.georgia.gov/Elections/														',
	'Hawaii		http://hawaii.gov/elections/voters/registration.htm	http://hawaii.gov/elections/voters/voteabsentee.htm		http://hawaii.gov/elections/														',
	'Idaho		http://www.idahovotes.gov/VoterReg/vtr_reg_form.pdf	http://www.idahovotes.gov/VoterReg/ABSENTEE.HTM	http://idahovotes.gov/YourPollingPlace/WhereDoIVote.aspx	http://www.idahovotes.gov/														',
	'Illinois		http://www.elections.il.gov/Downloads/ElectionInformation/PDF/registervote.pdf	http://www.elections.il.gov/Downloads/ElectionInformation/PDF/absevote.pdf		http://www.elections.state.il.us/														',
	'Indiana	http://www.indianavoters.com/PublicSite/Public/FT1/PublicLookupMain.aspx?Link=Registration	http://www.in.gov/sos/elections/vote_reg.html	http://www.in.gov/sos/elections/absentee.html	http://indianavoters.com/PublicSite/(X(1)A(GhFR-WUMoVaxvzpadIyulJoNZjMAfU8JsSK0HBoAU__zygJpD-v1sqWghuffVMM16mMsiiz10HH37frJTHrnQKnNtqRQzVrG1EYr1Ybh1WA1))/PublicMain.aspx	http://www.indianavoters.com/														',
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
	'New Jersey		http://www.nj.gov/oag/elections/voter-registration-application.html	http://www.nj.gov/oag/elections/absentee_doe.html	https://voter.njsvrs.com/PublicAccess/jsp/PollPlace/PollPlaceSearch.jsp	http://www.state.nj.us/state/elections/index.html														',
	'New Mexico	https://voterview.state.nm.us/	http://www.sos.state.nm.us/sos-Questions.html	http://www.sos.state.nm.us/sos-Questions.html	https://voterview.state.nm.us/	http://www.sos.state.nm.us/sos-elections.html														',
	'New York	https://voterlookup.elections.state.ny.us/votersearch.aspx	http://www.elections.state.ny.us/Voting.html	http://www.elections.state.ny.us/Voting.html	http://gis.nyc.gov/vote/ps/index.htm	http://www.vote.nyc.ny.us/														',
	'North Carolina	http://www.sboe.state.nc.us/VoterLookup.aspx	http://www.sboe.state.nc.us/content.aspx?id=23	http://www.sboe.state.nc.us/content.aspx?id=16	http://www.sboe.state.nc.us/PrecinctFinder.aspx	http://www.sboe.state.nc.us/														',
	'North Dakota		http://www.nd.gov/sos/electvote/voting/voter-qualifi.html	http://www.nd.gov/sos/electvote/voting/voting-absentee.html		http://www.nd.gov/sos/electvote/														',
	'Ohio	http://www.sos.state.oh.us/SOS/voterquery.aspx?page=361	http://www.sos.state.oh.us/SOS/elections/voterInformation/regToVote.aspx	http://www.sos.state.oh.us/SOS/elections/voterInformation/absentee.aspx	http://www.sos.state.oh.us/SOS/pollinglocation.aspx?page=361	http://www.sos.state.oh.us/SOS/voter.aspx														',
	'Oklahoma		http://www.state.ok.us/~elections/voterreg.html	http://www.state.ok.us/~elections/absentee.html	http://www.ok.gov/elections/ppl/index.php	http://www.ok.gov/~elections/														',
	'Oregon		http://www.sos.state.or.us/elections/votreg/vreg.htm	http://www.sos.state.or.us/elections/forms/sel111.pdf		http://www.sos.state.or.us/elections/														',
	'Pennsylvania	http://www.dos.state.pa.us/voting/cwp/view.asp?a=1206&Q=446253&sureNav=|	http://www.dos.state.pa.us/voting/cwp/view.asp?a=1192&q=443159&votingNav=|	http://www.dos.state.pa.us/voting/cwp/view.asp?a=1193&q=442991	https://www.pavoterservices.state.pa.us/Pages/PollingPlaceInfo.aspx	http://www.dos.state.pa.us/voting/														',
	'Rhode Island	http://www.sec.state.ri.us/vic/	http://www.elections.state.ri.us/registration/intro.htm	http://www.elections.state.ri.us/mailvote.htm	http://www.state.ri.us/vic/	http://www.elections.ri.gov/														',
	'South Carolina	https://webprod.cio.sc.gov/SCSECVoterWeb/voterInformationSearch.do	http://www.scvotes.org/south_carolina_voter_registration_information	http://www.state.sc.us/scsec/absent.htm		http://www.scvotes.org/														',
	'South Dakota	http://apps.sd.gov/applications/st25cers/	http://www.sdsos.gov/electionsvoteregistration/registrationvoting.shtm	http://www.sdsos.gov/electionsvoteregistration/registrationvoting.shtm#absentee	https://apps.sd.gov/applications/st25cers/	http://www.sdsos.gov/electionsvoteregistration/electionsvoteregistration_overview.shtm														',
	'Tennessee		http://www.state.tn.us/sos/election/registration.htm	http://www.state.tn.us/sos/election/bymail.htm		http://www.state.tn.us/sos/election/index.htm														',
	'Texas	https://voterinfo.sos.state.tx.us/voterws/viw/faces/Introduction.jsp	http://www.sos.state.tx.us/elections/voter/reqvr.shtml	http://www.sos.state.tx.us/elections/pamphlets/earlyvote.shtml		http://www.sos.state.tx.us/elections/index.shtml														',
	'Utah	http://gva1.utah.gov/elections/polling.aspx	http://elections.utah.gov/voterregistrationinformation.html	http://elections.utah.gov/absenteevoting.html	http://gva1.utah.gov/elections/polling.aspx	http://elections.utah.gov/														',
	'Vermont		http://vermont-elections.org/elections1/registertovote.html	http://www.vermont-elections.org/elections1/absentee.html		http://vermont-elections.org/														',
	'Virginia	https://www.voterinfo.sbe.virginia.gov/PublicSite/Public/FT2/PublicLookup.aspx?Link=Registration	http://www.sbe.virginia.gov/cms/Voter_Information/Registering_to_Vote/Index.html	http://www.sbe.virginia.gov/cms/Absentee_Voting/Index.html	https://www.voterinfo.sbe.virginia.gov/PublicSite/(A(aP4bRRCZVL9qe3b9rl3rP79KH1hIy94BDHBG9AMfLkC6xIMuUu1JioHMilqoBav7dGa2id4Dn-bu2lY8b3UOThIyYCEcdo4rPiKBd--mwB01))/Public/FT2/PublicPollingPlace.aspx?AspxAutoDetectCookieSupport=1	http://www.sbe.virginia.gov/cms/														',
	'Washington	https://wei.secstate.wa.gov/onlinevoterregistration/Registration.aspx	http://www.secstate.wa.gov/elections/register.aspx	http://www.secstate.wa.gov/elections/register_absentee.aspx	http://wei.secstate.wa.gov/OSOS/VoterVault/Pages/MyVote.aspx	http://www.secstate.wa.gov/elections/														',
	'West Virginia	http://www.wvvotes.com/voters/am-i-registered.php	http://www.wvsos.com/elections/voters/registernow.htm	http://www.wvsos.com/elections/voters/absentee.htm	http://www.wvvotes.com/voters/find-polling-place.php	http://www.wvvotes.com/														',
	'Wisconsin	http://elections.state.wi.us/category.asp?linkcatid=1773&linkid=270&locid=47	http://elections.state.wi.us/faq_detail.asp?faqid=119&fid=27	http://elections.state.wi.us/faq_detail.asp?faqid=120		http://elections.state.wi.us/														',
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

var userAgent = navigator.userAgent.toLowerCase(),
	msie = /msie/.test( userAgent ) && !/opera/.test( userAgent );

var localsearch = ! msie;

mapplet = window.mapplet;
var map, $jsmap, currentAddress;
var home = {}, vote = {};

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
	'<style type="text/css">',
		'body.gadget { margin:0; padding:0; }',
		'#wrapper, #wrapper * { font-family:Arial,sans-serif; font-size:10pt; }',
		'#spinner { z-index: 1; position:absolute; width:100%; height:100%; background-image:url(', baseUrl, 'spinner.gif); background-position:center; background-repeat:no-repeat; opacity:0.30; -moz-opacity:0.30; }',
		'#spinner { filter:alpha(opacity=30); }',
		'#title { margin-bottom:4px; }',
		'#title, #mapbox { overflow: auto; }',
	'</style>'
);

if( mapplet ) {
	document.write(
		'<style type="text/css">',
			'#PollingPlaceSearch, #PollingPlaceSearch td { font-size:10pt; margin:0; padding:0; }',
			'#PollingPlaceSearch { background-color:#EEE; border:1px solid #AAA; margin:0; padding:6px; width:96%; }',
			'.PollingPlaceSearchForm { margin:0; padding:0; }',
			'.PollingPlaceSearchTitle { /*font-weight:bold;*/ /*font-size:110%;*/ padding-bottom:4px; }',
			//'/*.PollingPlaceSearchSpinner { float:right; margin-right:4px; width:16px; height:16px; background-image:url(spinner16.gif); background-position:1000px 0px; background-repeat:no-repeat; }*/',
			//'.PollingPlaceSearchLabelBox { position:relative; float:left; margin-right:6px; }',
			'.PollingPlaceSearchLabel { color:#777; cursor: text; }',
			'.PollingPlaceSearchInput { width:100%; }',
			'#title { margin-top:12px; }',
		'</style>',
		'<div id="PollingPlaceSearch">',
			'<div class="PollingPlaceSearchTitle">',
				'Find your voting location, registration information and more. ',
				'Enter your <strong>home</strong>&nbsp;address:',
			'</div>',
			'<!--<div id="PollingPlaceSearchSpinner" class="PollingPlaceSearchSpinner">-->',
			'<!--</div>-->',
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
				'<div>',
					'<label id="PollingPlaceSearchLabel" for="PollingPlaceSearchInput" class="PollingPlaceSearchLabel">',
						'Example: 1600 Pennsylvania Ave 20006',
					'</label>',
				'</div>',
			'</form>',
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
	'<div style="padding:6px; width:96%; background-color:#FFEAC0; border:1px solid #FFBA90;">',
		'<div>',
			'Voting locations are currently only available for DC, DE, NH, NM, SC, and VT. ',
		'</div>',
		'<div style="margin-top:0.5em;">',
			'Registration information is available for all states.',
		'</div>',
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
};

function loadMap( a ) {
	GBrowserIsCompatible() && setTimeout( function() {
		$jsmap = $('#jsmap');
		var map = new GMap2( $jsmap[0], {
			mapTypes: [
				G_NORMAL_MAP,
				G_SATELLITE_MAP,
				G_SATELLITE_3D_MAP
			]
		});
		initMap( a, map );
	}, 1 );
}

function electionInfo() {
	return S(
		'<div style="padding-top:0.5em;">',
			election( 'status', 'Are you registered to vote?' ),
			election( 'info', '% voter registration info' ),
			election( 'absentee', 'Absentee voter info' ),
			election( 'elections', '% election website' ),
		'</div>'
	);
	
	function election( key, text ) {
		var state = home.info.state;
		var url = state.election[key];
		return ! url ? '' : S(
			'<div>',
				'<a target="_blank" href="', url, '">',
					text.replace( '%', state.name ),
				'</a>',
			'</div>'
		);
	}
}

function initMap( a, m ) {
	map = m;
	//var largeMapLink = mapplet ? '' : S(
	//	'<div style="padding-top:0.5em;">',
	//		'<a target="_blank" href="http://maps.google.com/maps?f=q&hl=en&geocode=&q=', encodeURIComponent( a.address.replace( / /g, '+' ) ), '&ie=UTF8&ll=', latlng, '&z=15&iwloc=addr">',
	//			'Large map and directions &#187;',
	//		'</a>',
	//	'</div>'
	//);
	var location = formatLocation( a, 'vote-icon-50.png', 'Your Voting Location' );
	var extra = S(
		'<div style="padding-top:0.5em;">',
			'<a target="_blank" href="http://maps.google.com/maps?f=d&saddr=', encodeURIComponent(home.info.address), '&daddr=', encodeURIComponent(vote.info.address), '&hl=en&mra=ls&ie=UTF8&iwloc=A&iwstate1=dir">',
				'Get directions',
			'</a>',
			' - ',
			'<a target="_blank" href="http://maps.google.com/maps?f=q&hl=en&geocode=&q=polling+places+loc+', encodeURIComponent( a.address.replace( / /g, '+' ) ), '&ie=UTF8&z=15&iwloc=A&iwstate1=stp">',
				'Send',
			'</a>',
		'</div>',
		electionInfo(),
		'<div style="padding-top:0.5em; line-height:1.2em; color:gray; font-size:80%;">',
			'This is a voting location for the US election on November 4, 2008. ',
			'Please check with your state or local election officials to verify your voting location.',
		'</div>'
	);
	if( mapplet ) $title.append( S(
		'<div style="padding-top:0.5em;">',
			location,
		'</div>'
	));
	vote.html = S(
		'<div style="font-family:Arial,sans-serif; font-size:10pt;">',
			location,
			extra,
		'</div>'
	);
	
	function ready() {
		setTimeout( function() {
			setMarker({ place:home, image:baseUrl+'marker-green.png' });
			setMarker({ place:vote, open:true });
		}, 500 );
	}
	
	function setMarker( a ) {
		var icon = new GIcon( G_DEFAULT_ICON );
		if( a.image ) icon.image = a.image;  // TODO!
		var marker = a.place.marker = new GMarker(
			new GLatLng( a.place.info.lat, a.place.info.lng ),
			{ icon:icon }
		);
		map.addOverlay( marker );
		var options = {
			maxWidth: mapplet ? 325 : Math.min( $jsmap.width() - 150, 325 )
			/*, disableGoogleLinks:true*/
		};
		marker.bindInfoWindow( $(a.place.html)[0], options );
		if( a.open ) marker.openInfoWindowHtml( a.place.html, options );
	}
	
	if( ! mapplet )
		GEvent.addListener( map, 'load', ready );
	
	// Initial position with marker centered
	var latlng = vote.latlng = new GLatLng( a.lat, a.lng ), center = latlng;
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

function formatLocation( info, icon, title ) {
	return S(
		'<div style="font-weight:bold; font-size:110%;">',
			title,
		'</div>',
		'<div style="padding-top:0.5em;">',
			'<table cellpadding="0" cellspacing="0">',
				'<tr valign="middle">',
					'<td style="width:50px; padding-right:.75em;">',
						'<img src="', baseUrl, icon, '" style="width:50px; height:50px;" />',
					'</td>',
					'<td>',
						'<div>',
							info.street,
						'</div>',
						'<div>',
							info.city, ', ', info.state.abbr, ' ', info.zip,
						'</div>',
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

function submit( addr ) {
	map && map.clearOverlays();
	currentAddress = addr;
	$title.empty();
	$map.empty();
	
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
					'<div style="padding-top:0.5em;">',
						'<strong>Select your address:</strong>',
					'</div>'
				));
				$title.append( formatPlaces(places) );
				$('input:radio',$title).click( function() {
					spin( true );
					findPrecinct( places[ this.id.split('-')[1] ] );
				});
			}
			else {
				$title.append( sorryHtml() );
			}
		}
	});
}

function findPrecinct( place ) {
	home.info = mapInfo( place );
	var address = currentAddress = place.address;
	var style = mapplet ? ' style="padding-top:0.5em;"' : '';
	var location = formatLocation( home.info, 'home-icon-50.png', 'Your Home' );
	home.html = S(
		'<div style="font-family:Arial,sans-serif; font-size:10pt;">',
			location,
		'</div>'
	);
	$title.html( location );
	lookup( address, function( data ) {
		if( data.errorcode != 2 ) sorry();
		else geocode( data.address[0], function( geo ) {
			var places = geo && geo.Placemark;
			if( ! places  ||  places.length != 1 ) sorry();
			else setMap( places[0] );
		});
	});
}

function sorry() {
	$map.html( sorryHtml() );
	spin( false );
}

function sorryHtml() {
	return S(
		'<div>',
			'<div style="padding-top:0.5em;">',
				'Sorry, we did not find a voting place for:<br />',
				'<strong>', formatAddress(window.currentAddress), '</strong>.',
			'</div>',
			'<div style="padding-top:0.5em;">',
				'We are working to provide this data soon. Until then, please check with your state or local election officials to verify your voting location.',
			'</div>',
			electionInfo(),
			//'<div style="padding-top:0.5em;">',
			//	'Suggestions:',
			//'</div>',
			//'<ul>',
			//	'<li>Make sure your address includes a street and number.</li>',
			//	'<li>Make sure all street and city names are spelled correctly.</li>',
			//	'<li>Make sure your address includes a city and state, or a zip code.</li>',
			//'</ul>',
		'</div>'
	);
}

function setMap( place ) {
	var a = vote.info = mapInfo( place );
	if( mapplet ) {
		initMap( a, new GMap2 );
	}
	else {
		a.width = $map.width();
		$map.height( a.height = $window.height() - $map.offset().top );
		$map.html( formatMap(a) );
		loadMap( a );
	}
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
	var state = stateByAbbr( area.AdministrativeAreaName );
	var sub = area.SubAdministrativeArea || area;
	var countyName = sub.SubAdministrativeAreaName;
	var locality = sub.Locality;
	var street = locality.Thoroughfare;
	var zip = locality.PostalCode;
	var coord = place.Point.coordinates;
	return {
		address: formatAddress(place.address),
		lat: coord[1],
		lng: coord[0],
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

if( mapplet ) {
	(function() {
		function e( id ) { return document.getElementById('PollingPlaceSearch'+id); }
		var /*spinner = e('Spinner'),*/ label = e('Label'), input = e('Input'), button = e('Button');
		button.disabled = false;
		
		window.PollingPlaceSearch = {
			
			focus: function() {
				label.style.textIndent = '-1000px';
			},
			
			blur: function() {
				if( input.value === '' )
					label.style.textIndent = '0px';
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
