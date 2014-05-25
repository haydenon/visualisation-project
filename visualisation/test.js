var w = 500;
var h = 100;
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
    populate(data);
});

function populate(netData){

    for(var i = 0; i<netData.length; i++){
        scores = netData[i].Score.split("-");
        if(scores.length>=2){
            dataset.push(parseInt(scores[0]) - parseInt(scores[1]));
        }
    }

    redraw();
}

function change() {
  redraw();
}

function redraw(){
    console.log(bh)
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
        .duration(300)
        .attr("y", function(d){
            if(d<0){
                return fromTop ? bh - bh/highest*Math.abs(d): bh;
            }
            else {
                return fromTop ? bh : bh - bh/highest*d;
            }
        });
}  