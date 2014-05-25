var w = 900;
var h = 400;
var bh = h/2;
var dataset = [];

var opt = d3.select("body")
                .select("select");

opt.on("change", change);

opt.selectAll("option")
    .data(["From Bottom","From Top"])
    .enter()
    .append("option")
    .text(function(d){
        return d;
    });

var svg = d3.select("body")
.append("svg")
.attr("width", w)
.attr("height", h);

d3.csv("data/2009.csv", function(data) {
    res = [];
    for(var i = 0; i<data.length; i++){
        scores = data[i].Score.split("-");
        if(scores.length>1){
            data[i].homeScore = parseInt(scores[0]);
            data[i].awayScore = parseInt(scores[1]);
            res.push(data[i]);
        }
    }
    populate(res);
});

function populate(netData){
    var num = 0;
    for(var i = 0; i<netData.length; i++){
        dataset.push(netData[i].homeScore-netData[i].awayScore);
    }

    redraw();
}

function change() {
  redraw();
}

function redraw(){
    var fromTop = opt.property("value")=="From Top";
    var barpadd = 1;
    Array.max = function( array ){
            return Math.max.apply( Math, array );
        };
    var highest = Array.max(dataset);
    var rects = svg.selectAll("rect")
        .data(dataset);
    rects.enter()
        .append("rect")
        .attr("x",function(d,i){
            return i*(w/dataset.length) + i*barpadd;
        })
        .attr("y", function(d){
            if(d<0){
                return fromTop ? bh - bh/highest*Math.abs(d): bh;
            }
            else {
                return fromTop ? bh : bh - bh/highest*d;
            }
        })
        .attr("width", function(d,i){
            return (w/dataset.length) - barpadd
        })
        .attr("height", function(d){
            return bh/highest*Math.abs(d);
        });
    rects.transition()
        .duration(600)
        .attr("y", function(d){
            if(d<0){
                return fromTop ? bh - bh/highest*Math.abs(d): bh;
            }
            else {
                return fromTop ? bh : bh - bh/highest*d;
            }
        });
}  