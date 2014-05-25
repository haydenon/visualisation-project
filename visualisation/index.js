var years = [2008,2009,2010,2011,2012,2013,'All']
var opt = d3.select("body").select("select");
opt.selectAll("option")
	.data(years)
	.enter()
	.append("option")
	.text(function(d){
		return d;
	});
opt.on("change", change);


var aus = {};
aus.names = "Australia"
var nz = {};
nz.names = "New Zealand"
var teams = createTeams();

function createTeams(){
	var returnTeams = [];
	var teamMap = {};
	for (var i = 0; i < 10; i++) {
		var add = {
			homeMatches: [],
			awayMatches: []
		};
		add.country = i < 5 ? aus : nz;
		returnTeams.push(add);
	}
	returnTeams[0].names = "New South Wales Swifts";
	teamMap["New South Wales Swifts"] = returnTeams[0];
	returnTeams[1].names = "Adelaide Thunderbirds";
	teamMap["Adelaide Thunderbirds"] = returnTeams[1];
	returnTeams[2].names = "Melbourne Vixens";
	teamMap["Melbourne Vixens"] = returnTeams[2];
	returnTeams[3].names = "West Coast Fever";
	teamMap["West Coast Fever"] = returnTeams[3];
	returnTeams[4].names = "Queensland Firebirds";
	teamMap["Queensland Firebirds"] = returnTeams[4];
	returnTeams[5].names = "Central Pulse";
	teamMap["Central Pulse"] = returnTeams[5];
	returnTeams[6].names = "Northern Mystics";
	teamMap["Northern Mystics"] = returnTeams[6];
	returnTeams[7].names = "Waikato Bay of Plenty Magic";
	teamMap["Waikato Bay of Plenty Magic"] = returnTeams[7];
	returnTeams[8].names = "Southern Steel";
	teamMap["Southern Steel"] = returnTeams[8];
	returnTeams[9].names = "Canterbury Tactix";
	teamMap["Canterbury Tactix"] = returnTeams[9];
	return {
		teams: returnTeams,
		teamMap: teamMap
	};
}

var dataset;
d3.csv("data/combined.csv", function(d) {
	dataset=setupData(d);
	redraw();
});

function setupData(d){
	var netballData = {};
	netballData.venues = getVenues(d);
	netballData.matches = getMatches(d, netballData.venues);
	netballData.matches.matches.forEach(function(d){
		if(d.year==2008)
			console.log(d.draw+","+d.year+","+d.round+","+d.homeWon+","+d.homeScore+"-"+d.awayScore+","+d.homeTeam.names+","+d.awayTeam.names);
	})
	//NEED MAP FROM TEAM TO RESULTS. (IS THIS EVERY SEASON? HOW DO WE DO THAT?)
	//netballData.teamsToResults = getTeamToResults(d);
	//NEED MAP FROM TEAM TO RIVALS
	//NEED MAP FROM VENUES TO RESULTS
	return netballData;
}

function getVenues(d){
	venues = {};
	d.forEach(function(match){
		if(venues[match.Venue]!=undefined){
			venues[match.Venue] = {
				name: match.Venue,
				matches: []
			};
		}
	});
	return venues;
}

function getMatches(d, venues){
	var yearMatches = {
		2008: [],
		2009: [],
		2010: [],
		2011: [],
		2012: [],
		2013: []
	};
	var matches = [];
	d.forEach(function(match){
		if(match.Date.substring(0,4)=="BYES")
			return;
		var year = parseInt(match.Year);
		var round = parseInt(match.Round);
		var date = match.Date;
		var homeTeam =  teams.teamMap[match['Home Team']];
		var awayTeam =  teams.teamMap[match['Away Team']];
		var venue = venues[match.Venue];
		var score = match.Score;
		var draw = false;
		var homeScore;
		var awayScore;
		if(score.substring(0,4)=='draw'){
			score = score.split(" ")[1].split("-");
			draw = true;
			homeScore = parseInt(score[0]);
			awayScore = parseInt(score[1]);
		}	
		else{
			score = score.split("-");
			homeScore = parseInt(score[0]);
			awayScore = parseInt(score[1]);
		}
		var homeWon = homeScore>awayScore;
		var matchOb = {
			year: year,
			round: round,
			date: date,
			homeTeam: homeTeam,
			awayTeam: awayTeam,
			venue: venue,
			score: score,
			draw: draw,
			homeScore: homeScore,
			awayScore: awayScore,
			homeWon: homeWon
		};
		console.log(matchOb.homeTeam)
		matches.push(matchOb);
		yearMatches[year].push(matchOb);
		homeTeam.homeMatches.push(matchOb);
		awayTeam.awayMatches.push(matchOb);
	});
	return {
		yearMatches: yearMatches,
		matches: matches
	};
}

function getTeamToResults(d){
	d.forEach(function(match){

	});
}

function change(){
	redraw();
}

function redraw(){
	var w = 900;
	var h = 400;
	var bh = h/2;
	var svg = d3.select("body")
		.append("svg")
		.attr("width", w)
		.attr("height", h);
	var year = opt.property("value");
	teamWins = [];
	teams.teams.forEach(function(t){
		var hm = [];
		var am = [];
		if(year=="All"){
			
		}
		else{

		}
	});
}
