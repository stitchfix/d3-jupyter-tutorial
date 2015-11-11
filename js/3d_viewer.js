
var el_width = 960,
    el_height = 500;


var margin = {top: 20, right: 20, bottom: 20, left: 20},
    width = el_width * 0.75 - margin.left - margin.right,
    height = el_width * 0.75 - margin.top - margin.bottom;

d3.select("#maindiv${divnum}").selectAll("svg").remove();
var svg = d3.select("#maindiv${divnum}").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);


// viewport division lines and labels

var divider_coords = [{"x1": width / 2.0, "x2": width / 2.0, "y1": 0, "y2": height},
                      {"x1": 0, "x2": width, "y1": height / 2.0, "y2": height / 2.0}];
                      
var divider_label_config = [ {"text": "Top", "x": 10, "y": 10},
                             {"text": "Front", "x": 10, "y": (height/2.0) + 10},
                             {"text": "Right", "x": (width/2.0) + 10, "y": (height/2.0) + 10} ];

var divider_g = svg.append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

divider_g.selectAll(".divider")
    .data(divider_coords)
  .enter().append("line")
    .attr("class", "divider")
    .attr("x1", function(d) { return d.x1; })
    .attr("x2", function(d) { return d.x2; })
    .attr("y1", function(d) { return d.y1; })
    .attr("y2", function(d) { return d.y2; })
    .style("stroke", "black")
    .style("stoke-width", 2);

divider_g.selectAll(".dividerlabel")
    .data(divider_label_config)
  .enter().append("text")
    .attr("class", "dividerlabel")
    .attr("x", function(d) { return d.x; })
    .attr("y", function(d) { return d.y; })
    .attr("dy", ".35em")
    .text(function(d) { return d.text; });


// viewport setup

var viewport_padding = 20;

var viewport_config = [
      {"h": [viewport_padding, (width / 2.0) - viewport_padding], 
       "v": [(height / 2.0) - viewport_padding, viewport_padding], 
       "hdim": "x", "vdim": "y", "zdim": "z"},
      {"h": [viewport_padding, (width / 2.0) - viewport_padding], 
       "v": [height - viewport_padding, (height / 2.0) + viewport_padding], 
       "hdim": "x", "vdim": "z", "zdim": "y"},
      {"h": [(width / 2.0) + viewport_padding, width - viewport_padding], 
       "v": [height - viewport_padding, (height / 2.0) + viewport_padding], 
       "hdim": "y", "vdim": "z", "zdim": "x"}
    ]

var viewport = [];
var h = [];
var v = [];
for (var i=0; i<viewport_config.length; i++) {
  h.push( d3.scale.linear().range(viewport_config[i]["h"]) );
  v.push( d3.scale.linear().range(viewport_config[i]["v"]) );
  viewport.push( svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")") );
}



//d3.csv("data.csv", function(error, data) {
//  if (error) throw error;
var data = $data;

  data[0].points.forEach(function(d) {
    d.x = +d.x;
    d.y = +d.y;
    d.z = +d.z;
  });

  data[0].triangles.forEach(function(d) {
    d.x1 = +d.x1;
    d.y1 = +d.y1;
    d.z1 = +d.z1;
    d.x2 = +d.x2;
    d.y2 = +d.y2;
    d.z2 = +d.z2;
    d.x3 = +d.x3;
    d.y3 = +d.y3;
    d.z3 = +d.z3;
  });

  for (var i=0; i<viewport_config.length; i++) {
    
    // viewport scales
    
    var hdim_pts_extent = [99999,-99999];
    var vdim_pts_extent = [99999,-99999];
    if (data[0].points.length > 0) {
      hdim_pts_extent = d3.extent(data[0].points, function(d) { return d[viewport_config[i]["hdim"]]; });
      vdim_pts_extent = d3.extent(data[0].points, function(d) { return d[viewport_config[i]["vdim"]]; });
    }

    var hdim_tri1_extent = [99999,-99999];
    var vdim_tri1_extent = [99999,-99999];
    var hdim_tri2_extent = [99999,-99999];
    var vdim_tri2_extent = [99999,-99999];
    var hdim_tri3_extent = [99999,-99999];
    var vdim_tri3_extent = [99999,-99999];
    if (data[0].triangles.length > 0) {
      hdim_tri1_extent = d3.extent(data[0].triangles, function(d) { return d[viewport_config[i]["hdim"] + "1"]; });
      vdim_tri1_extent = d3.extent(data[0].triangles, function(d) { return d[viewport_config[i]["vdim"] + "1"]; });
      hdim_tri2_extent = d3.extent(data[0].triangles, function(d) { return d[viewport_config[i]["hdim"] + "2"]; });
      vdim_tri2_extent = d3.extent(data[0].triangles, function(d) { return d[viewport_config[i]["vdim"] + "2"]; });
      hdim_tri3_extent = d3.extent(data[0].triangles, function(d) { return d[viewport_config[i]["hdim"] + "3"]; });
      vdim_tri3_extent = d3.extent(data[0].triangles, function(d) { return d[viewport_config[i]["vdim"] + "3"]; });
    }
    
    var hdim_extent = [ Math.min( hdim_pts_extent[0], hdim_tri1_extent[0], hdim_tri2_extent[0], hdim_tri3_extent[0] ) , 
                        Math.max( hdim_pts_extent[1], hdim_tri1_extent[1], hdim_tri2_extent[1], hdim_tri3_extent[1] )];

    var vdim_extent = [ Math.min( vdim_pts_extent[0], vdim_tri1_extent[0], vdim_tri2_extent[0], vdim_tri3_extent[0] ) , 
                        Math.max( vdim_pts_extent[1], vdim_tri1_extent[1], vdim_tri2_extent[1], vdim_tri3_extent[1] )];
    
    var hdim_size = hdim_extent[1] - hdim_extent[0];
    var vdim_size = vdim_extent[1] - vdim_extent[0];
    
    if (hdim_size > vdim_size) {
      h[i].domain(hdim_extent);
      v[i].domain([ vdim_extent[0] - (hdim_size - vdim_size) / 2 , vdim_extent[1] + (hdim_size - vdim_size) / 2 ]);
    } else {
      h[i].domain([ hdim_extent[0] - (vdim_size - hdim_size) / 2 , hdim_extent[1] + (vdim_size - hdim_size) / 2 ]);
      v[i].domain(vdim_extent);
    }



    // triangles
    
    var check_intercept = function(x0,y0,x1,y1,x2,y2,x3,y3) {
      
      // check if parallel, if so return false
      if ( Math.abs((y1-y0)/(x1-x0)) == Math.abs((y3-y2)/(x3-x2)) ) { 
        // note: should probably be checked for overlap
        return [false, 0, 0]; 
      } else {
        var c1 = ( (y2-y0)/y1 - (x2-x0)/x1 ) / ( x3/x1 - y3/y1 );
        var c0 = (x2-x0)/x1 + c1 * (x3/x1);
        if ( (c0 > 0) && (c0 < 1) && (c1 > 0) && (c1 < 1) ) {
          return [true, c0, c1];
        }
      }
      return [false, 0, 0];
    }
    
    // z-dimension sorting
    data[0].triangles.sort(function(a,b) {

      // for convenience
      var x = viewport_config[i]["hdim"];
      var y = viewport_config[i]["vdim"];
      var z = viewport_config[i]["zdim"];
      
      // check for overlap in x-y plane
      var lines = [[1,2],[2,3],[3,1]];
      lines.forEach(function(line_a){
        lines.forEach(function(line_b){

          // does line_a intersect line_b ?
          var ci = check_intercept( a[x + line_a[0]], a[y + line_a[0]],
                                    a[x + line_a[1]], a[y + line_a[1]],
                                    b[x + line_b[0]], b[y + line_b[0]],
                                    b[x + line_b[1]], b[y + line_b[1]] );
          if (ci[0]) {
            var c0 = ci[1];
            var c1 = ci[2];
            var z_int_a = a[z + line_a[0]] + c0 * a[z + line_a[1]];
            var z_int_b = b[z + line_b[0]] + c1 * b[z + line_b[1]];
            if (z_int_a > z_int_b) {
              return 1;
            } else if (z_int_a < z_int_b) {
              return -1;
            } else {
              return 0;
            }
          }
        });
      });

      // if no overlap, return 0
      return 0;
    });
    
    viewport[i].selectAll(".triangle")
        .data(data[0].triangles)
      .enter().append("polygon")
        .attr("class", function(d,j) { return "triangle d" + j; })
        .attr("points", function(d) {
            var s = "";
            for (var j=1; j<4; j++) {
              s += h[i](d[viewport_config[i]["hdim"] + j]) + ",";
              s += v[i](d[viewport_config[i]["vdim"] + j]) + " ";
            }
            s = s.substring(0, s.length - 1);
            return s;
          })
        .style("fill", "grey")
        .style("stroke", "black")
        .style("stroke-width", 0.5)
        .style("fill-opacity", 0.8)
        .on("click", function(event) {
            var class_name = d3.select(this).attr("class");
            d3.selectAll(".triangle").style("fill", 'grey');
            d3.selectAll("." + class_name.replace("triangle ","")).style("fill", 'red');
          });

    // points

    var points = viewport[i].selectAll(".dot")
        .data(data[0].points)
      .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 1.5)
        .attr("cx", function(d) { return h[i](d[viewport_config[i]["hdim"]]); })
        .attr("cy", function(d) { return v[i](d[viewport_config[i]["vdim"]]); })
        .style("fill", "steelblue");

  }

//});

