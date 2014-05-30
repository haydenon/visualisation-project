var wd = window.innerWidth-40;
var h = 500;
var svg = d3.select("body")
	.append("svg")
	.attr("width", wd)
	.attr("height", h);
window.onresize = function(event) {
    wd = window.innerWidth-40;
    svg.attr("width",wd)
    change();
};
var aniDur = 800;

mode = d3.select("body").select("select#mode");
mode.on("change",change);

countrySort = d3.select("body").select("input#byCountry");
countrySort.on("change",change);

accumulative = d3.select("body").select("input#accumulative");
accumulative.on("change",change);

yearsRange = d3.select("body").select("input#years");
yearsRange.on("change",change);

roundsRange = d3.select("body").select("input#round");
roundsRange.on("change",change);

net = d3.select("body").select("input#net");
net.on("change",change);
total = d3.select("body").select("input#total");
total.on("change",change);

detailedBox = d3.select("body").select("input#detailed");
detailedBox.on("change",change);

wins = d3.select("body").select("input#wins");
wins.on("change",change);
goalsTog = d3.select("body").select("input#goals");
goalsTog.on("change",change);

chooser = d3.select("body").select("select#chooser");
chooser.on("change",change)

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
d3.csv("data/final.csv", function(d) {
	dataset=setupData(d);
	change();
});

function setupData(d){
	var netballData = {};
	netballData.venues = getVenues(d);
	netballData.matches = getMatches(d, netballData.venues.venues);
	//NEED MAP FROM TEAM TO RESULTS. (IS THIS EVERY SEASON? HOW DO WE DO THAT?)
	//netballData.teamsToResults = getTeamToResults(d);
	//NEED MAP FROM TEAM TO RIVALS
	//NEED MAP FROM VENUES TO RESULTS
	return netballData;
}

function getVenues(d){
	venueList = [];
	venues = {};
	d.forEach(function(match){
		if(venues[match.Venue]==undefined){
			var v = {
				names: match.Venue,
				matches: []
			};
			venues[match.Venue] = v;
			venueList.push(v);
		}
	});
	venueList.sort(function(a,b){return a.names.localeCompare(b.names)});
	return {
		venues: venues,
		venueList: venueList
	};
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
		venue.homeTeam = homeTeam;
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
		var homePlace = parseInt(match['Home Placement']);
		var awayPlace = parseInt(match['Away Placement']);
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
			homeWon: homeWon,
			homePlace: homePlace,
			awayPlace: awayPlace
		};
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

function matchesToYear(y,r){
	return function(element){
		return element.year <= y && element.round<=r;
	};
}

function matchesFromYear(y,r){
	return function(element){
		return element.year == y && element.round<=r;
	};
}

function winMatch(home){
	return function(element){
		//NEED TO DO SOMETHING ABOUT DRAW
		return (element.homeWon && home) || (!home && !element.homeWon);
	};
}

var currMode;

function change(){
	currMode = mode.property("value");
	if(currMode=="Venues"){
		var opts = chooser.selectAll("option")
			.data(dataset.venues.venueList);
		opts.enter()
			.append("option")
		opts.text(function(d){return d.names;})
		opts.exit().remove();
	}
	else {
		var tms = [{names: "All"}];
		tms.push.apply(tms,teams.teams.slice(0))
		var opts = chooser.selectAll("option")
			.data(tms);
		opts.enter()
			.append("option");
		opts.text(function(d){return d.names;})
		opts.exit().remove();
	}
	redraw();
}

function teamPosCompare(a,b){
	if(countrySort.property('checked') && a.team.country != b.team.country){
		return a.team.country == aus ? -1 : 1;
	}
	if((a.place-b.place)!=0){
		return a.place - b.place;
	}
	if(a.points != b.points){
		return a.points - b.points;	
	}
    var difgp = (a.totfor()/a.totag())*100.0 - (b.totfor()/b.totag())*100.0;
    if(difgp!=0){
    	return difgp;
    }
    return (a.totfor() - a.totag()) - (b.totfor() - b.totag());
}

function getValues(){
	var year = parseInt(yearsRange.property("value"))+2008;
	var accum = accumulative.property('checked');
	var round = parseInt(roundsRange.property("value"))
	matches = dataset.matches.matches;
	if(accum){
		matches = matches.filter(matchesToYear(year,round));
	}
	else {
		matches = matches.filter(matchesFromYear(year,round));
	}
	var venue;
	if(currMode == "Venues"){
		venue = dataset.venues.venues[chooser.property("value")];
		matches = matches.filter(function(m){
			return m.venue == venue;
		})
	}

	var teamPlace = {};
	teams.teams.forEach(function(t){
		var obData = {
			team: t,
			points: 0,
			homewins: 0, awaywins: 0, overwins: 0,
			homeloses: 0, awayloses: 0, overloses: 0,
			homefor: 0, homeag: 0,
			awayfor: 0, awayag: 0,
			overfor: 0, overag: 0,
			place: 0
		}
		obData.totwins = function(){ return this.homewins+this.awaywins+this.overwins; }
		obData.totloses = function(){ return this.homeloses+this.awayloses+this.overloses; }
		obData.totfor = function(){ return this.homefor+this.awayfor+this.overfor; }
		obData.totag = function(){ return this.homeag+this.awayag+this.overag; }
		teamPlace[t.names] = obData;
	});


	matches.forEach(function(m){
		over = m.homeTeam.country != m.awayTeam.country;
		if(m.draw){
			teamPlace[m.homeTeam.names].points+=1;
			teamPlace[m.awayTeam.names].points+=1;
		}
		else {
			if(m.homeWon){
				teamPlace[m.homeTeam.names].points+=2;
				teamPlace[m.homeTeam.names].homewins+=1;
				if(over) teamPlace[m.awayTeam.names].overloses+=1;
				else teamPlace[m.awayTeam.names].awayloses+=1;
			}
			else {
				teamPlace[m.awayTeam.names].points+=2;
				teamPlace[m.homeTeam.names].homeloses+=1;
				if(over) teamPlace[m.awayTeam.names].overwins+=1;
				else teamPlace[m.awayTeam.names].awaywins+=1;
			}
		}

		teamPlace[m.homeTeam.names].homefor+=m.homeScore;
		teamPlace[m.homeTeam.names].homeag+=m.awayScore;
		if(over){
			teamPlace[m.awayTeam.names].overfor+=m.awayScore;
			teamPlace[m.awayTeam.names].overag+=m.homeScore;
		}
		else{
			teamPlace[m.awayTeam.names].awayfor+=m.awayScore;
			teamPlace[m.awayTeam.names].awayag+=m.homeScore;
		}
	});

	if(round>14 && accum!=true){ //GETS FINAL POSITIONING
		finals = matches.filter(function(m){
			return m.round>14;
		});
		finals.forEach(function(f){
			teamPlace[f.homeTeam.names].place = f.homePlace;
			teamPlace[f.awayTeam.names].place = f.awayPlace;
		});
	}

	teamOrder = [];
	teams.teams.forEach(function(t){
		teamPlacement = teamPlace[t.names];
		teamOrder.push(teamPlacement);
	});
	teamOrder.sort(teamPosCompare);
	var teamData = getPointWinValues(teamOrder,teamPlace);
	if(currMode=="Venues") teamData.homeTeam = venue.homeTeam;
	return teamData;
}

function getRivalValues(rivalTeam){
	var rt = teams.teamMap[rivalTeam];
	var year = parseInt(yearsRange.property("value"))+2008;
	var accum = accumulative.property('checked');
	var round = parseInt(roundsRange.property("value"))
	matches = dataset.matches.matches;
	if(accum){
		matches = matches.filter(matchesToYear(year,round));
	}
	else {
		matches = matches.filter(matchesFromYear(year,round));
	}
	matches = matches.filter(function(m){
		return m.homeTeam == rt || m.awayTeam == rt;
	});

	var tms = teams.teams.slice(0);
	var ind = tms.indexOf(rt);
	tms.splice(ind,1);

	var teamPlace = {};
	tms.forEach(function(t){
		var obData = {
			team: t,
			points: 0,
			homewins: 0, awaywins: 0, overwins: 0,
			homeloses: 0, awayloses: 0, overloses: 0,
			homefor: 0, homeag: 0,
			awayfor: 0, awayag: 0,
			overfor: 0, overag: 0,
			place: 0
		}
		obData.totwins = function(){ return this.homewins+this.awaywins+this.overwins; }
		obData.totloses = function(){ return this.homeloses+this.awayloses+this.overloses; }
		obData.totfor = function(){ return this.homefor+this.awayfor+this.overfor; }
		obData.totag = function(){ return this.homeag+this.awayag+this.overag; }
		teamPlace[t.names] = obData;
	});

	matches.forEach(function(m){
		isHome = rt == m.homeTeam;
		over = m.homeTeam.country != m.awayTeam.country;

		if(m.draw);
		else {
			if(m.homeWon){
				if(isHome && over){teamPlace[m.awayTeam.names].overloses+=1;}
				else if (isHome && !over){teamPlace[m.awayTeam.names].awayloses+=1;} 
				else {
					teamPlace[m.homeTeam.names].points+=2;
					teamPlace[m.homeTeam.names].homewins+=1;
				}
			}
			else {
				if(isHome && over){
					teamPlace[m.awayTeam.names].points+=2;
					teamPlace[m.awayTeam.names].overwins+=1;
				}
				else if(isHome && !over){
					teamPlace[m.awayTeam.names].points+=2;
					teamPlace[m.awayTeam.names].awaywins+=1;
				}
				else {
					teamPlace[m.homeTeam.names].homeloses+=1;
				}
			}
		}
		if(!isHome){
			teamPlace[m.homeTeam.names].homefor+=m.homeScore;
			teamPlace[m.homeTeam.names].homeag+=m.awayScore;
		}
		else{
			if(over){
				teamPlace[m.awayTeam.names].overfor+=m.awayScore;
				teamPlace[m.awayTeam.names].overag+=m.homeScore;
			}
			else{
				teamPlace[m.awayTeam.names].awayfor+=m.awayScore;
				teamPlace[m.awayTeam.names].awayag+=m.homeScore;
			}
		}
	});

	teamOrder = [];
	tms.forEach(function(t){
		tP = teamPlace[t.names];
		totgames = tP.totwins() + tP.totloses();
		thres = totgames/4;
		if(tP.totwins()<thres || tP.totloses()<thres) return;
		thresdif = totgames*10;
		if(Math.abs(tP.totfor() - tP.totag())>thresdif) return;
		teamOrder.push(tP);
	});
	//console.log(teamOrder.length);
	teamOrder.sort(teamPosCompare);
	var teamData = getPointWinValues(teamOrder,teamPlace);
	return teamData;

}

function getPointWinValues(to,tp){
	var net = !Boolean(total.property("checked"));
	var detailed = detailedBox.property('checked');
	var goals = Boolean(goalsTog.property('checked'));
	var gensetone = []; var gensettwo = [];
	var homesetone = []; var homesettwo = [];
	var oversetone = []; var oversettwo = [];
	var tm = [];
	to.forEach(function(t,i){
		tm.push(t.team);
		tplace = tp[t.team.names];
		if(net){
			if(!detailed){
				var totval = goals ? tplace.totfor() - tplace.totag() : tplace.totwins()-tplace.totloses();
				gensetone.push({team: t.team, num: totval, i: i});
			}
			else {
				var homeval = goals ? tplace.homefor - tplace.homeag : tplace.homewins - tplace.homeloses;
				var generalval = goals ? tplace.awayfor - tplace.awayag : tplace.awaywins - tplace.awayloses;
				var overval = goals ? tplace.overfor - tplace.overag : tplace.overwins - tplace.overloses;
				gensetone.push({team: t.team, num: generalval, i: i});
				homesetone.push({team: t.team, num: homeval, i: i});
				oversetone.push({team: t.team, num: overval, i: i});
			}
		}
		else {
			if(!detailed){
				var totpval = goals ? tplace.totfor(): tplace.totwins();
				var totnval = goals ? -tplace.totag() : -tplace.totloses();
				gensetone.push({team: t.team, num: totpval, i: i});
				gensettwo.push({team: t.team, num: totnval, i: i});
			}
			else{
				var homepval = goals ? tplace.homefor : tplace.homewins;
				var generalpval = goals ? tplace.awayfor : tplace.awaywins;
				var overpval = goals ? tplace.overfor : tplace.overwins;
				var homenval = goals ? -tplace.homeag : -tplace.homeloses;
				var generalnval = goals ? -tplace.awayag : -tplace.awayloses;
				var overnval = goals ? -tplace.overag : -tplace.overloses;
				gensetone.push({team: t.team, num: generalpval, i: i});
				homesetone.push({team: t.team, num: homepval, i: i});
				oversetone.push({team: t.team, num: overpval, i: i});
				gensettwo.push({team: t.team, num: generalnval, i: i});
				homesettwo.push({team: t.team, num: homenval, i: i});
				oversettwo.push({team: t.team, num: overnval, i: i});
			}
		}
	})
	
	return {
		teams: tm,
		length: to.length,
		gensetone: gensetone,
		homesetone: homesetone,
		oversetone: oversetone,
		gensettwo: gensettwo,
		homesettwo: homesettwo,
		oversettwo: oversettwo,
	};
}

function redraw(){
	rivalTeam = chooser.property("value");
	var teamData;
	if(currMode!="Teams" || rivalTeam=="All")
		teamData = getValues();
	else
		teamData = getRivalValues(rivalTeam);

	//now draw
	if(currMode=="Teams" && rivalTeam=="All")
		drawTeamData(teamData,0);
	else if(currMode=="Venues"){
		drawTeamData(teamData,(wd/10)*1.5);
		drawHomeTeam(teamData.homeTeam, wd/10,"Home Team:");
	}
	else {
		// drawTeamData({
		// 	gensetone: [{team: tm, num: 1, i: 0},{team: tmt, num: 2, i: 1}],
		// 	homesetone: [{team: tm, num: 1, i: 0},{team: tmt, num: 2, i: 1}],
		// 	oversetone: [{team: tm, num: 1, i: 0},{team: tmt, num: 2, i: 1}],
		// 	gensettwo: [{team: tm, num: -2, i: 0},{team: tmt, num: -1, i: 1}],
		// 	homesettwo: [{team: tm, num: -2, i: 0},{team: tmt, num: -1, i: 1}],
		// 	oversettwo: [{team: tm, num: -2, i: 0},{team: tmt, num: -1, i: 1}],
		// 	length: 2,
		// 	teams: [tm,tmt]
		// },(wd/10)*1.5);
		drawTeamData(teamData,(wd/teamData.length)*1.5);
		drawHomeTeam(teams.teamMap[rivalTeam], wd/10,"Rivals Of:");
	}
	
}

function teamRectSettings(s,type,posy,negy,cd,highest){
   	s.enter()
   		.append("rect")
   		.attr("class",type);
    s.transition()
    	.duration(aniDur)
    	.attr("y", function(d){
        	var i = d.i;
            if(d.num<0){
                return cd.mh + negy[i];
            }
            else {
                return cd.mh - cd.bh/highest*d.num - posy[i];
            }
        })
    	.attr("height", function(d){
        	var i = d.i;
            var height =  cd.bh/highest*Math.abs(d.num);
        	if(d.num<0) negy[i] += height; 
    		else posy[i] += height;
    		return height;
        })
        .attr("x",function(d){
        	var i = d.i;
            return cd.x + i*(cd.w/posy.length);
        })
        .attr("width", function(d){
            return (cd.w/posy.length) - cd.bp
        })
        .attr("class", function(d){
        	return type+' '+(d.num>0 ? 'positive' : 'negative');
        });
    s.exit().remove();
}

function drawTeamData(teamData,x){
	var x = x;
	var w = wd - x;
	var barpad = 1;
	var imgpad = 3;
	var imgh = h/4
	var imgw = w/teamData.length - 2 * imgpad;
	var imgh = imgh<imgw ? imgh : imgw;
	var bh = (h-imgh)/2
	var mh = (h-imgh)/2 + imgh;

	var cd = {
		bp: barpad,
		ip: imgpad,
		ih: imgh,
		iw: imgw,
		bh: bh,
		mh: mh,
		x: x,
		w: w
	}
	

    var highest = 1;

    var posy = Array.apply(null, new Array(teamData.length)).map(Number.prototype.valueOf,0);
    var negy = Array.apply(null, new Array(teamData.length)).map(Number.prototype.valueOf,0);

    var genonevals = teamData.gensetone;
    var homeonevals = teamData.homesetone;
    var overonevals = teamData.oversetone;
    var gentwovals = teamData.gensettwo;
    var hometwovals = teamData.homesettwo;
    var overtwovals = teamData.oversettwo;

	genonevals.forEach(function(t){if(t.num>0)posy[t.i]+=t.num; else negy[t.i]+=t.num});	
	homeonevals.forEach(function(t){if(t.num>0)posy[t.i]+=t.num; else negy[t.i]+=t.num});
	overonevals.forEach(function(t){if(t.num>0)posy[t.i]+=t.num; else negy[t.i]+=t.num});
	gentwovals.forEach(function(t){if(t.num>0)posy[t.i]+=t.num; else negy[t.i]+=t.num});	
	hometwovals.forEach(function(t){if(t.num>0)posy[t.i]+=t.num; else negy[t.i]+=t.num});
	overtwovals.forEach(function(t){if(t.num>0)posy[t.i]+=t.num; else negy[t.i]+=t.num});

    for(var i = 0; i<teamData.length; i++){
    	highest = highest > posy[i] ? highest : posy[i];
    	highest = highest > Math.abs(negy[i]) ? highest : Math.abs(negy[i]);
    }

    svg.selectAll(".home-team")
    	.remove();

    posy = Array.apply(null, new Array(teamData.length)).map(Number.prototype.valueOf,0);
    negy = Array.apply(null, new Array(teamData.length)).map(Number.prototype.valueOf,0);

    var homeone = svg.selectAll("rect.home-one")
    	.data(homeonevals, function(d){return d.team.names+".home-one"});
    if(homeonevals.length == 0)
    	homeone.exit().remove();
    else
    	teamRectSettings(homeone,"home-one",posy,negy,cd,highest);

    var genone = svg.selectAll("rect.gen-one")
    	.data(genonevals, function(d){return d.team.names+".gen-one"});
    if(genonevals.length == 0)
    	genone.exit().remove();
    else
    	teamRectSettings(genone,"gen-one",posy,negy,cd,highest);

    var overone = svg.selectAll("rect.over-one")
    	.data(overonevals, function(d){return d.team.names+".over-one"});
    if(overonevals.length == 0)
    	overone.exit().remove();
    else
    	teamRectSettings(overone,"over-one",posy,negy,cd,highest);

    var hometwo = svg.selectAll("rect.home-two")
    	.data(hometwovals, function(d){return d.team.names+".home-two"});
    if(hometwovals.length == 0){
    	hometwo.exit().remove();
    }
    else
    	teamRectSettings(hometwo,"home-two",posy,negy,cd,highest);

    var gentwo = svg.selectAll("rect.gen-two")
    	.data(gentwovals, function(d){return d.team.names+".gen-two"});
    if(gentwovals.length == 0)
    	gentwo.exit().remove();
    else
    	teamRectSettings(gentwo,"gen-two",posy,negy,cd,highest);

    var overtwo = svg.selectAll("rect.over-two")
    	.data(overtwovals, function(d){return d.team.names+".over-two"});
    if(overtwovals.length == 0)
    	overtwo.exit().remove();
    else
    	teamRectSettings(overtwo,"over-two",posy,negy,cd,highest);

	//DRAW IMAGES
    var images = svg.selectAll("image")
    	.data(teamData.teams, function(d){
        	return d.names;
        });
	images.enter()
		.append("image")
		.attr("x",function(d,i){
            return cd.x + i*(cd.w/teamData.length);
        })
        .attr("y",function(d){
            return 0;
        })
        .attr("width",function(d,i){
            return cd.ih;
        })
        .attr("height",function(d,i){
            return cd.ih;
        })
        .attr("xlink:href", function(d){
        	return 'images/'+d.names+'.png';
        });
    images.transition()
    	.duration(aniDur)
        .attr("x",function(d,i){
            return cd.x + i*(cd.w/teamData.length);
        })
        .attr("width",function(d,i){
            return cd.ih;
        });
    images.exit().remove();
}

function drawHomeTeam(homeTeam,width,text){
	hometext = svg.append("text");
	hometext.text(text)
		.attr("x",width/4)
		.attr("y",width-5)
        .attr("class","home-team");

	homeimage = svg.selectAll("image.home-team")
		.data([homeTeam.names]);
	homeimage.enter()
		.append("image")
		.attr("y",width)
		.attr("x",width/4)
        .attr("width",width)
        .attr("height",width)
        .attr("xlink:href", function(d){
        	return 'images/'+d+'.png';
        })
        .attr("class","home-team");
}