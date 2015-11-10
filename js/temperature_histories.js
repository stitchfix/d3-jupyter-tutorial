
// context

var svgID = "graph-svg";
var width = $("#graph-svg").width(); //750;
var height = 500;


// graph code



// configuration variables

currentSite = "718160"; 

currentYM = "1990-1";

currentType = "ave";
currentTypeIA1 = "min";
currentTypeIA2 = "max";

activeTypeText = { "ave": "AVERAGE TEMPERATURE",
                   "min": "MINIMUM TEMPERATURE",
                   "max": "MAXIMUM TEMPERATURE" }

inactiveTypeText = { "ave": "AVE",
                     "min": "MIN",
                     "max": "MAX" }

var tempTicks = [0,10,20,30,40,50,60,70,80,90,100];
var colors = ["#9e0142","#d53e4f","#f46d43","#fdae61","#fee08b","#ffffbf","#e6f598","#abdda4","#66c2a5","#3288bd","#5e4fa2"];

monthStr = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

var mapWidth = 600;
var mapHeight = 320;

var leftMargin =  Math.max(0,(width-600) / 2); //75;

var mapScale = 90;
var mapCenter = [0,-30];
var mapTranslate = [280,250];

var animateTextX = leftMargin + 290;
var animateTextY = 346;
var startTriangleX = (leftMargin + 300);
var startTriangleY = 338;

var xAxisRange = [leftMargin + 20, leftMargin + 550];
var xAxisY = 358;
var yAxisRange = [475, 380];

var handleX = leftMargin + 200;
var handleY1 = 358;
var handleY2 = 495;
var handleTextX = leftMargin + 210;
var handleTextY = 375;
var siteNameTextX = leftMargin + 560;
var siteNameTextY = 325;
var siteNameTextAnchor = "end";
var tempTypeText1X = leftMargin + 10;
var tempTypeText2X = leftMargin + 10;
var tempTypeText3X = leftMargin + 10;
var tempTypeText1Y = 325;
var tempTypeText2Y = 310;
var tempTypeText3Y = 295;
var colorLegendX = leftMargin + 565;

if (width < 600) {
  mapWidth = Math.max(500,width);
  var modi = Math.min(1,(600-width)/(600-500));
  mapHeight = 320 - 160*modi;
  mapScale = 90-(45*modi);
  mapTranslate = [280-(140*modi),250-(125*modi)];
  xAxisRange = [15, width - 55];
  colorLegendX = width - 45;
  tempTypeText1X = 5;
  tempTypeText2X = 5;
  tempTypeText3X = 35;
  tempTypeText1Y = 310;
  tempTypeText2Y = 295;
  tempTypeText3Y = 295;
  startTriangleX = (width - 37) / 2;
  siteNameTextX = 5;
  siteNameTextAnchor = "start";

  handleY1 = mapHeight + 30 + 38;
  handleY2 = mapHeight + 30 + 175;
  handleTextY = mapHeight + 30 + 55;
  siteNameTextY = mapHeight + 30 + 5;
  tempTypeText1Y = mapHeight + 30 - 10;
  tempTypeText2Y = mapHeight + 30 - 25;
  tempTypeText3Y = mapHeight + 30 - 25;
  xAxisY = mapHeight + 30 + 38;
  yAxisRange = [mapHeight + 30+ 155, mapHeight + 30 + 60];
  startTriangleY = mapHeight + 30 + 18;
  $("#graph-svg").height(mapHeight + 30 + 180);

}


// segments / groupings of svg

var svg = d3.select("#"+svgID);

svg.append("g").append("svg")
    .attr("id","map")
    .attr("width",mapWidth)
    .attr("height",mapHeight)
    .attr("transform", "translate(" + leftMargin + ",0)");

d3.select("#map").append("g")
    .attr("id","mapCountries");

d3.select("#map").append("g")
    .attr("id","mapSites");

svg.append("g")
    .attr("id","linegraphs");


// slider and axes configuration

var x = d3.scale.linear()
    .domain([1945, 2010])
    .range(xAxisRange)
    .clamp(true);

var y = d3.scale.linear()
    .domain([0, 100])
    .range(yAxisRange);

var brush = d3.svg.brush()
    .x(x)
    .extent([0, 0]);


// map variables

var projection = d3.geo.mercator()
    .center(mapCenter)
    .scale(mapScale)
    .rotate([0,0])
    .translate(mapTranslate);

var path = d3.geo.path()
    .projection(projection)
    .pointRadius(1);

var color = d3.scale.linear()
    .domain(tempTicks.reverse())
    .range(colors)
    .interpolate(d3.interpolateHcl);



// read files, draw map, initiate slider, slider function

mapdata = $worldmapdata ;
sitesdata = $sitesdata ;


    // draw axes, slider, etc

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + xAxisY + ")")
        .call(d3.svg.axis()
          .scale(x)
          .orient("top")
          .tickFormat(function(d) { if (d == 1945 || d == 2010) {return d}; })
          .tickSize(0)
          .tickPadding(12))
      .select(".domain")
      .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); });
    
    var slider = svg.append("g")
        .attr("class", "slider")
        .call(brush);
    
    slider.selectAll(".extent,.resize")
        .remove();
    
    var handle = slider.append("line")
        .attr("class", "handle")
        .attr("x1", handleX).attr("y1", handleY1)
        .attr("x2", handleX).attr("y2", handleY2);
    
    var handleText = slider.append("text")
        .attr("class", "handleText")
        .attr("x", handleTextX).attr("y", handleTextY)
        .attr("text-anchor", "start")
        .text("");

    var siteNameText = svg.append("text")
        .attr("class", "siteNameText")
        .attr("id", "siteText" )
        .attr("x", siteNameTextX).attr("y", siteNameTextY)
        .attr("text-anchor", siteNameTextAnchor)
        .text("");

    var tempTypeText1 = svg.append("text")
        .attr("class", "tempTypeTextActive")
        .attr("id", "tempTypeText1" )
        .attr("x", tempTypeText1X).attr("y", tempTypeText1Y)
        .attr("text-anchor", "start")
        .text("AVERAGE TEMPERATURE");

    var tempTypeText2 = svg.append("text")
        .attr("class", "tempTypeTextInactive")
        .attr("id", "tempTypeText2" )
        .attr("x", tempTypeText2X).attr("y", tempTypeText2Y)
        .attr("text-anchor", "start")
        .text("MIN")
        .on("click", function(e){
            var save = currentType;
            currentType = currentTypeIA1;
            currentTypeIA1 = save;
            d3.select("#tempTypeText2").text(inactiveTypeText[currentTypeIA1]);
            d3.select("#tempTypeText1").text(activeTypeText[currentType]);
            updateLinegraph(currentSite,currentType);
            updateMapColors(currentYM);
          });

    var tempTypeText3 = svg.append("text")
        .attr("class", "tempTypeTextInactive")
        .attr("id", "tempTypeText3" )
        .attr("x", tempTypeText3X).attr("y", tempTypeText3Y)
        .attr("text-anchor", "start")
        .text("MAX")
        .on("click", function(e){
            var save = currentType;
            currentType = currentTypeIA2;
            currentTypeIA2 = save;
            d3.select("#tempTypeText3").text(inactiveTypeText[currentTypeIA2]);
            d3.select("#tempTypeText1").text(activeTypeText[currentType]);
            updateLinegraph(currentSite,currentType);
            updateMapColors(currentYM);
          });
    
    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + colorLegendX + ",0)")
        .call(d3.svg.axis()
          .scale(y)
          .orient("right")
          .tickFormat(function(d) { 
              if (d == 0 || d == 20 || d == 40 || d == 60 || d == 80) {return d}
              else if (d == 100) {return "" + d + "F"}; 
            })
          .tickSize(0)
          .tickPadding(12));
    
    var colorList = [];
    for (var i = 0; i <= 100; i+=1) {
      colorList.push(i);
    }

    d3.select("#linegraphs").selectAll(".colorLegend")
        .data(colorList)
      .enter().append("circle")
        .attr("class", "colorLegend")
        .attr("r",2)
        .attr("fill", function(d) { return color(d); })
        .attr("cy", function(d){ return y(d); })
        .attr("cx", function(d){ return colorLegendX; });

    
    // draw map and sites

    d3.select("#mapCountries").selectAll(".pathCountry")
        .data(mapdata.features)
      .enter().append("path")
        .attr("class", "pathCountry")
        .attr("d", path);

    d3.select("#mapSites").selectAll(".pathSite")
        .data(sitesdata)
      .enter()
        .append("circle")
        .attr("class","pathSite")
        .attr("r",3)
        .attr("stroke-opacity",1e-6)
        .attr("USAF", function(d) {return d.ID;})
        .attr("station_name", function(d) {return d.station_name;})
        .attr("country_name", function(d) {return d.country_name;})
        .attr("transform", function(d) {return "translate(" + projection([d.lon,d.lat]) + ")";})
        .on("click", function(e){
                  
            // determine which point is selected
            pt = d3.select(this)[0][0].attributes;
            USAF = pt.USAF.value;
            station_name = pt.station_name.value;
            country_name = pt.country_name.value;
                  
            // write to text line
            d3.select("#siteText").text(station_name + ", " + country_name);
            
            // demarcate point
            d3.selectAll(".pathSite").style("stroke-opacity",1e-6);
            d3.select(this).style("stroke-opacity",1);
            
            // update graph
            updateLinegraph(USAF,currentType);
            
            // update currentSite variable
            currentSite = USAF;
      
          });
    
    // function: update linegraph

    function updateLinegraph(USAF,tempType) {

      var v = sitesdata.filter(function(k){ return k.ID == USAF; });
              
      var linearray = $.map(v[0]["temps"], function(value, index) {
        value["year"] = Number(index.split("-")[0]) + (Number(index.split("-")[1]) - 1) / 12;
        value["dateText"] = monthStr[Number(index.split("-")[1]) - 1] + " " + index.split("-")[0] ;
        return [value];
      });
        
      var c = d3.select("#linegraphs").selectAll(".linegraph")
          .data(linearray);
      c.enter().append("circle");
      c.exit().remove();
      c
          .attr("class", "linegraph")
          .attr("r",2)
          .attr("fill", function(d) { 
              var v = d[tempType] ;
              return color(v);
            })
          .attr("cy", function(d){ return y(d[tempType]); })
          .attr("cx", function(d){ return x(d.year); })
          .attr("title", function(d){ 
              return d.dateText + " : " + (d[tempType]).toFixed(2) + "F"; 
            });

    }
    
    // initialize linegraph
    var s = d3.select("#mapSites").selectAll(".pathSite");
    var pt = s.filter(function(k){ return k.ID == currentSite; });
    station_name = pt[0][0].attributes.station_name.value;
    country_name = pt[0][0].attributes.country_name.value;
    d3.select("#siteText").text(station_name + ", " + country_name);
    pt.style("stroke-opacity",1);
    updateLinegraph(currentSite,currentType);
    
    
    // function: on slider movement
    
    function brushed() {
    
      // get year and monthNum from slider movement
      var value = brush.extent()[0];
      if (d3.event.sourceEvent) { // not a programmatic event
        value = x.invert(d3.mouse(this)[0]);
        brush.extent([value, value]);
      }
      var year = Math.floor(value);
      var monthNum = Math.floor((value - year)*12);
      
      // update handle location and handle text
      handle
          .attr("x1", x(value))
          .attr("x2", x(value));
      handleText
          .attr("x", x(value) + 5)
          .text(monthStr[monthNum] + " " + year);

      // update sliderlocation variable for animation
      sliderlocation = value;
      currentYM = "" + year + "-" + (monthNum+1);
      
      // update fill colors of site points
      updateMapColors(currentYM);
      
    };
    
    function updateMapColors(ym) {

      d3.select("#mapSites").selectAll(".pathSite")
        .attr("fill", function(d) {
            if (ym in d.temps) {
              var v = d.temps[ym][currentType] ;
              return color(v);
            } else {
              return "#999";
            }
          });
    
    };

    // initialize slider
    brush.on("brush", brushed);
    sliderlocation = 1990.0;
    slider
        .call(brush.extent([sliderlocation, sliderlocation]))
        .call(brush.event);
    
    // animation button
    var line = d3.svg.line()
                 .x(function(d) { return d.x; })
                 .y(function(d) { return d.y; })
                 .interpolate("linear");
    startTriangle = [ { "x": 0, "y": 0}, { "x": 0, "y": 10}, { "x": 8, "y": 5} ];
    stopRectangle = [ { "x": 0, "y": 0}, { "x": 0, "y": 10}, { "x": 10, "y": 10}, { "x": 10, "y": 0} ];
    animationOn = false;
    animationObj = {};
    function animator() {
      slider
          .call(brush.extent([sliderlocation, sliderlocation]))
          .call(brush.event);
      if (sliderlocation >= 2010.0) { 
          animationOn = false;
          clearInterval(animationObj); 
          var p = d3.select("#linegraphs").selectAll(".pathStart").data([startTriangle]);
          p.enter().append("path");
          p.exit().remove();
          p.attr("d", function(d){ return line(d) + "Z";});
      } else { 
        sliderlocation += 1.0/12.0; 
      }
    };
    d3.select("#linegraphs").append("path")
        .data([startTriangle])
        .attr("class", "pathStart")
        .attr("d", function(d){ return line(d);})
        .attr("transform", "translate(" + startTriangleX + "," + startTriangleY + ")")
        .on("click", function(e) {
            if (animationOn) {
              animationOn = false;
              clearInterval(animationObj);
              d3.select(this).data([startTriangle])
                .attr("d", function(d){ return line(d);});
            } else {
              animationOn = true;
              d3.select(this).data([stopRectangle])
                .attr("d", function(d){ return line(d);});
              animationObj = setInterval( function () {animator()}, 1 );
            }
          });

    if (width > 600) {
      var animateText = svg.append("text")
          .attr("class", "siteNameText")
          .attr("x", animateTextX).attr("y", animateTextY)
          .attr("text-anchor", "end")
          .text("animate");
    }




