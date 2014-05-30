var w = window.innerWidth-40;
var h = 550;
var svg = d3.select("body")
	.append("svg")
	.attr("width", w)
	.attr("height", h);
window.onresize = function(event) {
    w = window.innerWidth-40;
    svg.attr("width",w)
    change();
};
var aniDur = 800;

countrySort = d3.select("body").select("input#byCountry");
countrySort.on("change",change);

accumulative = d3.select("body").select("input#accumulative");
accumulative.on("change",change);

yearsRange = d3.select("body").select("input#years");
yearsRange.on("change",change);

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
	netballData.matches = getMatches(d, netballData.venues);
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

function change(){
	
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
	var round = 17
	matches = dataset.matches.matches;
	if(accum){
		matches = matches.filter(matchesToYear(year,round));
	}
	else {
		matches = matches.filter(matchesFromYear(year,round));
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
	// 	teamPlacement.num = teamPlacement.totwins() - teamPlacement.totloses();
	// 	teamPlacement.values = getPointWinValues(teamPlacement,false);
		teamOrder.push(teamPlacement);
	});
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
	teamData = getValues();

	//now draw
	var barpad = 1;
	var imgpad = 3;
	var imgh = h/4
	var imgw = w/teamData.length - 2 * imgpad;
	var imgh = imgh<imgw ? imgh : imgw;
	var bh = (h-imgh)/2
	var mh = (h-imgh)/2 + imgh;

    var highest = 0;

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

    for(var i = 0; i<teamData.length; i++){
    	highest = highest > posy[i] ? highest : posy[i];
    	highest = highest > Math.abs(negy[i]) ? highest : Math.abs(negy[i]);
    }

    posy = Array.apply(null, new Array(teamData.length)).map(Number.prototype.valueOf,0);
    negy = Array.apply(null, new Array(teamData.length)).map(Number.prototype.valueOf,0);

    var homeone = svg.selectAll("rect.home-one")
    	.data(homeonevals, function(d){return d.team.names+".home-one"});
    if(homeonevals.length == 0)
    	homeone.exit().remove();
    else
    	teamRectSettings(homeone,"home-one",posy,negy,mh,bh,barpad,highest);

    var genone = svg.selectAll("rect.gen-one")
    	.data(genonevals, function(d){return d.team.names+".gen-one"});
    if(genonevals.length == 0)
    	genone.exit().remove();
    else
    	teamRectSettings(genone,"gen-one",posy,negy,mh,bh,barpad,highest);

    var overone = svg.selectAll("rect.over-one")
    	.data(overonevals, function(d){return d.team.names+".over-one"});
    if(overonevals.length == 0)
    	overone.exit().remove();
    else
    	teamRectSettings(overone,"over-one",posy,negy,mh,bh,barpad,highest);

    var hometwo = svg.selectAll("rect.home-two")
    	.data(hometwovals, function(d){return d.team.names+".home-two"});
    if(hometwovals.length == 0){
    	console.log("here");
    	hometwo.exit().remove();
    }
    else
    	teamRectSettings(hometwo,"home-two",posy,negy,mh,bh,barpad,highest);

    var gentwo = svg.selectAll("rect.gen-two")
    	.data(gentwovals, function(d){return d.team.names+".gen-two"});
    if(gentwovals.length == 0)
    	gentwo.exit().remove();
    else
    	teamRectSettings(gentwo,"gen-two",posy,negy,mh,bh,barpad,highest);

    var overtwo = svg.selectAll("rect.over-two")
    	.data(overtwovals, function(d){return d.team.names+".over-two"});
    if(overtwovals.length == 0)
    	overtwo.exit().remove();
    else
    	teamRectSettings(overtwo,"over-two",posy,negy,mh,bh,barpad,highest);
   		

    // var rects = svg.selectAll("rect")
    //     .data(teamData, function(d){
    //     	return d.team.names;
    //     });
    // rects.enter()
    //     .append("rect")
    //     .attr("x",function(d,i){
    //         return i*(w/teamData.length);
    //     })
    //     .attr("y", function(d){
    //         if(d.num<0){
    //             return mh;
    //         }
    //         else {
    //             return Math.floor(mh - bh/highest*d.num);
    //         }
    //     })
    //     .attr("width", function(d,i){
    //         return (w/teamData.length) - barpad
    //     })
    //     .attr("height", function(d){
    //     	var height = Math.floor(bh/highest*Math.abs(d.num))
    //         return height;
    //     })
    //     .attr("class",function(d){
    //     	return d.num>0 ? 'positive' : 'negative';
    //     });
    // rects.transition()
    // 	.duration(aniDur).attr("y", function(d){
    //         if(d.num<0){
    //             return mh;
    //         }
    //         else {
    //             return Math.floor(mh - bh/highest*d.num);
    //         }
    //     })
    // 	.attr("height", function(d){
    //         return Math.floor(bh/highest*Math.abs(d.num));
    //     })
    //     .attr("x",function(d,i){
    //         return i*(w/teamData.length);
    //     })
    //     .attr("width", function(d,i){
    //         return (w/teamData.length) - barpad
    //     })
    //     .attr("class",function(d){
    //     	return d.num>0 ? 'positive' : 'negative';
    //     });

	//DRAW IMAGES
    var images = svg.selectAll("image")
    	.data(teamData.teams, function(d){
        	return d.names;
        });
	images.enter()
		.append("image")
		.attr("x",function(d,i){
            return i*(w/teamData.length);
        })
        .attr("y",function(d){
            return 0;
        })
        .attr("width",function(d,i){
            return imgh;
        })
        .attr("height",function(d,i){
            return imgh;
        })
        .attr("xlink:href", function(d){
        	return 'images/'+d.names+'.png';
        });
    images.transition()
    	.duration(aniDur)
        .attr("x",function(d,i){
            return i*(w/teamData.length);
        })
        .attr("width",function(d,i){
            return imgh;
        });
}

function teamRectSettings(s,type,posy,negy,mh,bh,barpad,highest){
   	s.enter()
   		.append("rect")
   		.attr("class",type);
    s.transition()
    	.duration(aniDur)
    	.attr("y", function(d){
        	var i = d.i;
            if(d.num<0){
                return mh + negy[i];
            }
            else {
                return mh - bh/highest*d.num - posy[i];
            }
        })
    	.attr("height", function(d){
        	var i = d.i;
            var height =  bh/highest*Math.abs(d.num);
        	if(d.num<0) negy[i] += height; 
    		else posy[i] += height;
    		return height;
        })
        .attr("x",function(d){
        	var i = d.i;
            return i*(w/posy.length);
        })
        .attr("width", function(d){
            return (w/posy.length) - barpad
        })
        .attr("class", function(d){
        	return type+' '+(d.num>0 ? 'positive' : 'negative');
        });
    s.exit().remove();
}