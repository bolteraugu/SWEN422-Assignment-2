// set the dimensions and margins of the graph
var margin = {top: 30, right: 700, bottom: 30, left: 60},
    width = 1700 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Adds commas in the appropriate position based on the number 'x'          
function numberWithCommas(x) {
  return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

//Read the data
d3.csv("https://raw.githubusercontent.com/ahadrahman/SWEN422-Assignment-2-Data/main/clean_data.csv",

  function(data) {

    var allGroup = ["Scans", "Active_Devices", "Bluetooth"]

    // Reformat the data: we need an array of arrays of {x, y} tuples
    var dataReady = allGroup.map( function(grpName) { 
      return {
        name: grpName,
        values: data.map(function(d) {
          return {Date : d3.timeParse("%d/%m/%y")(d.Date), value: +d[grpName]};
        })
      };
    });


    // A color scale: one color for each group
    var myColor = {
      "Scans": "orange",
      "Active_Devices": "green",
      "Bluetooth": "steelblue",
      "Hidden" : "grey",
    };
    
    // Add X axis in date format
    var x = d3.scaleTime()
      .domain(d3.extent(dataReady[0].values, function(d) { return d.Date; }))
      .range([ 0, width ]);
    xAxis = svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    // Add Y axis in numeric format
    var y = d3.scaleLinear()
      .domain([0, d3.max(data, function(d) { return +d.Scans*1.1; })])
      .range([ height, 0 ]);
    yAxis = svg.append("g")
      .call(d3.axisLeft(y));

    // This allows to find the closest X index of the mouse:
    var bisect = d3.bisector(function(d) { return d.Date; }).left;
    
    // Create the line that travels along the curve of chart on hover
    var focus = svg
      .append('g')
      .append('line')
        .attr("stroke-dasharray", "10,3")
        .attr("stroke", "#000")
        .attr("y1", 0).attr("y2", height); 


    // Add a clipPath: everything out of this area won't be drawn.
    var clip = svg.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", width )
        .attr("height", height )
        .attr("x", 0)
        .attr("y", 0);

    // Add brushing
    var brush = d3.brushX()                   // Add the brush feature using the d3.brush function
        .extent( [ [0,0], [width,height] ] )  // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
        .on("end", updateChart)               // Each time the brush selection changes, trigger the 'updateChart' function

    // Create the line variable: where both the line and the brush take place
    var line = svg.append('g')
      .attr("clip-path", "url(#clip)")


    dataReady.forEach(dt => {
      // Add the line
      line.append("path")
        .datum(dt.values)
        .attr("class", dt.name)  // I add the class line to be able to modify this line later on.
        .attr("fill", "none")
        .style("stroke", function(d){ return myColor[dt.name] })
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
          .defined(function(d) { return d.value != 0; }) // Present gaps in the line for missing data
          .x(function(d) { return x(d.Date) })
          .y(function(d) { return y(d.value) })
        )

    });

    // Add a label at the end of each line
    svg
    .selectAll("myLabels")
    .data(dataReady)
    .enter()
      .append('g')
      .append("text")
        .attr("class", function(d){ console.log(d); return d.name })
        .datum(function(d) { 
          console.log({name: d.name, value: d.values[d.values.length - 1]}); 
          return {name: d.name, value: d.values[d.values.length - 1]}; 
        }) // keep only the last value of each time series
        .attr("transform", function(d) { return "translate(" + x(d.value.Date) + "," + y(d.value.value) + ")"; }) // Put the text at the position of the last point
        .attr("x", 12) // shift the text a bit more right
        .text(function(d) { return d.name.replace("_", " "); })
        .style("fill", function(d){ return myColor[d.name] })
        .style("font-size", 15)

    // Add a legend (interactive)
    svg
    .selectAll("myLegend")
    .data(dataReady)
    .enter()
      .append('g')
      .append("text")
      .attr('class', function(dt) {
        return "legend-" + dt.name;
      })
      .attr('x', function(d,i){
        if (i < 2) {
          return (width/2 - 50) + (i*60)
        } else {
          return 600;
        }
      })
      .attr('y', 0)
      .text(function(d) { return d.name.replace("_", " "); })
      .attr("style", "outline: thin solid black;")   //This will do the job
      .style("fill", function(d){ return myColor[d.name] })
      .style("font-size", 15)
        
      .on("click", function(d){
        // is the element currently visible ?
        currentOpacity = d3.selectAll("." + d.name).style("opacity")
        // Change the opacity: from 0 to 1 or from 1 to 0
        d3.selectAll("." + d.name).transition().style("opacity", currentOpacity == 1 ? 0:1)
        d3.selectAll(".legend-" + d.name).transition().style("fill", currentOpacity == 0 ? myColor[d.name] : myColor['Hidden']) //Change label to grey

      })

    // Add the brushing to the line
    line
      .append("g")
        .attr("class", "brush")
        .call(brush);

    line
      .style("fill", "none")
      .style("pointer-events", "all")
      .on('mouseover', mouseover)
      .on('mousemove', mousemove)
      .on('mouseout', mouseout);

    // Create the text that travels along the curve of chart (Date)
    var focusText1 = svg
      .append('g')
      .append('text')
        .style("opacity", 1)
        .attr("text-anchor", "left")
        .attr("alignment-baseline", "middle")

    // Create the text that travels along the curve of chart (Scans)
    var focusText2 = svg
      .append('g')
      .append('text')
        .style("opacity", 1)
        .attr("text-anchor", "left")
        .attr("alignment-baseline", "middle")

    // Create the text that travels along the curve of chart (Active Devices)
    var focusText3 = svg
      .append('g')
      .append('text')
        .style("opacity", 1)
        .attr("text-anchor", "left")
        .attr("alignment-baseline", "middle")

    // Create the text that travels along the curve of chart (Bluetooth)
    var focusText4 = svg
      .append('g')
      .append('text')
        .style("opacity", 1)
        .attr("text-anchor", "left")
        .attr("alignment-baseline", "middle")

    // What happens when the mouse move -> show the annotations at the right positions.
    function mouseover() {
      focus.style("opacity", 1)
    }

    function mousemove() {
      console.log("hover");
      let resultsMap = new Map();
      let dateX;

      dataReady.forEach(dt => {
        // recover coordinate we need
        var x0 = x.invert(d3.mouse(this)[0]);
        var i = bisect(dt.values, x0, 1);
        selectedData = dt.values[i]
        resultsMap.set(dt.name, selectedData.value);
        dateX = selectedData.Date;
      });

      focus
        .attr("x1", x(dateX))
        .attr("x2", x(dateX))

      focusText1
        .text(dateX.toDateString() + ": ")
        .attr('text-decoration', "underline")
        .attr('font-weight', "bold")
        .attr("x", x(dateX) + 10)
        .attr("y", height/5)

      focusText2
        .text(numberWithCommas(resultsMap.get('Scans')) + " scans ")
        .attr("x", x(dateX) + 10)
        .attr("y", height/5 + 30)

      focusText3
        .text(numberWithCommas(resultsMap.get('Active_Devices')) + " active devices")
        .attr("x", x(dateX) + 10)
        .attr("y", height/5 + 60)

      focusText4
        .text(numberWithCommas(resultsMap.get('Bluetooth')) + " Bluetooth enabled")
        .attr("x", x(dateX) + 10)
        .attr("y", height/5 + 90)
    }
    function mouseout() {
      focus.style("opacity", 1)
    }

    // A function that set idleTimeOut to null
    var idleTimeout
    function idled() { idleTimeout = null; }

    // A function that update the chart for given boundaries
    function updateChart() {

      console.log("here");
      // What are the selected boundaries?
      extent = d3.event.selection

      // If no selection, back to initial coordinate. Otherwise, update X axis domain
      if(!extent){
        if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
        x.domain([ 4,8])
      }else{
        x.domain([ x.invert(extent[0]), x.invert(extent[1]) ])
        line.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
      }

      // Update axis and line position
      xAxis.transition().duration(1000).call(d3.axisBottom(x))

      dataReady.forEach(dt => {
        line
            .select("." + dt.name)
            .transition()
            .duration(1000)
            .attr("d", d3.line()
              .defined(function(d) { return d.value != 0; })
              .x(function(d) { return x(d.Date) })
              .y(function(d) { return y(d.value) })
            )
      });
    }

    d3.select("#reset").on("click", reset);

    function reset() {
      x.domain(d3.extent(dataReady[0].values, function(d) { return d.Date; }))
      xAxis.transition().call(d3.axisBottom(x))
      
      dataReady.forEach(dt => {
        line
            .select("." + dt.name)
            .transition()
            .duration(1000)
            .attr("d", d3.line()
              .defined(function(d) { return d.value != 0; })
              .x(function(d) { return x(d.Date) })
              .y(function(d) { return y(d.value) })
            )
      });
    }
})