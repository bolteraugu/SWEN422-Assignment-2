// These are the websites that I got source code / help code from: 
// This helped with the rendering of the actual graph
// https://www.d3-graph-gallery.com/graph/bubblemap_tooltip.html
// This helped me with loading in things as a csv
// https://www.tutorialsteacher.com/d3js/loading-data-from-file-in-d3js
// This helped with hover tooltips
// https://bl.ocks.org/d3noob/a22c42db65eb00d4e369
// This was used to help with selection of circles (when you mouseover something and the colour changes)
// https://www.d3indepth.com/selections/
// This helped me with the mouseover and a popup dialogue thing + tooltips
// https://www.d3-graph-gallery.com/graph/interactivity_tooltip.html
// This hlped me with zoom
// https://www.d3-graph-gallery.com/graph/interactivity_zoom.html
// This helped with the changing of colours when the button is pressed
// https://www.d3-graph-gallery.com/graph/barplot_button_color.html

// This part of the code I got from Ahad
var width = window.innerWidth
var height = window.innerHeight

// This is to switch between the data 
var showingnumber = true

// The svg
var svg = d3.select("#my_dataviz")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .call(d3.zoom().scaleExtent([1, 5]).on("zoom", function () {
    svg.attr("transform", d3.event.transform)
  }))
  .style("font-family", "Arial")

// This is what is rendered when you hover over a circle
var tooltip = d3.select("#myTooltip")
  .style("opacity", 1)
  .style("font-size", "16px")
  .style("font-family", "Arial")

// This is when we click on two spots to compare them
var comparetip = d3.select("#myCompareTip")
  .style("position", "absolute")
  .style("visibility", "hidden")
  .style("border", "solid")
  .style("border-width", "1px")
  .style("border-radius", "5px")
  .style("padding", "10px")
  .style("width", "500px")
  .style("height", "90px")
  .style("font-family", "Arial")

// This is for the button on screen
var buttontip = d3.select("#myButtonTip")
  .style("position", "absolute")
  .style("bottom", "0")
  .style("width", "250px")
  .style("height", "105px")
  .style("font-size", "20px")
  .style("font-family", "Arial")
  .style("color", "black")
  .style("background-color", "#69A2B3")
  .style("border-width", "3px")

// Changes the variable so we can rest the data to be shown
function changeVariable() {
  showingnumber = !showingnumber;

  // This changes the text on the button
  if (showingnumber) {
    changeVariables("#69A2B3")
  }
  else {
    changeVariables("#B36969")
  }
}

// This method changes the size of the circles
function changeVariables(color) {
  d3.selectAll("circle")
    .transition()
    .duration(200)
    .attr("r", function (d) {
      if (showingnumber) return (0.0005 * d.value)
      else return (2 * d.ratio)
    })
    .style("fill", color)
    .attr("stroke", color)

  // Render a different button with different colours depending on what the user has selected (to show the actual figures or the percentages)
  if (showingnumber) {
    buttontip
      .transition()
      .duration(200)
      .style("background-color", color)
      .text("Show Percentage of Fully Vaccinated People")
  }
  // This is when you want to see the percentages
  else {
    buttontip
      .transition()
      .duration(200)
      .style("background-color", color)
      .text("Show Numbers of Fully Vaccinated People")
  }

}

// Map and projection
var projection = d3.geoMercator()
  .center([175, -40])                // Which point of the map will be the centre point of the screen (x, y) 
  .scale(2050)                       // Zoom on the map
  .translate([width / 2, height / 2])

// The different DHB locations with their longitude and latitude points (N, E) to be plotted on the map 
var markers = [
  { long: 174.764, lat: -36.85, name: "Auckland Metro", number: 0, value: 85716, ratio: 5.17 },
  { long: 176.642, lat: -37.89, name: "Bay of Plenty", number: 1, value: 15250, ratio: 5.89 },
  { long: 171.163, lat: -43.754, name: "Canterbury", number: 2, value: 37653, ratio: 6.51 },
  { long: 174.908, lat: -41.209, name: "Capital & Coast and Hutt Valley", number: 3, value: 28491, ratio: 8.89 },
  { long: 176.580, lat: 39.602, name: "Hawke's Bay", number: 4, value: 12000, ratio: 7.77 },
  { long: 176.238, lat: -38.405, name: "Rotorua (Lakes)", number: 5, value: 6049, ratio: 6.04 },
  { long: 175.610, lat: -40.355, name: "Palmerston North (MidCentral)", number: 6, value: 8190, ratio: 4.40 },
  { long: 173.762, lat: -41.592, name: "Nelson Marlborough", number: 7, value: 12800, ratio: 8.032 },
  { long: 173.932, lat: -35.414, name: "Northland", number: 8, value: 8500, ratio: 4.40 },
  { long: 170.501, lat: -45.880, name: "South Canterbury (Dunedin)", number: 9, value: 4295, ratio: 0.683 },
  { long: 168.661, lat: -45.030, name: "Southern", number: 10, value: 32200, ratio: 9.33 },
  { long: 178.324, lat: -38.136, name: "Tairawhiti (Gisbourne)", number: 11, value: 3600, ratio: 7.24 },
  { long: 174.438, lat: -39.354, name: "Taranaki", number: 12, value: 7056, ratio: 6.002 },
  { long: 175.023, lat: -37.619, name: "Waikato", number: 13, value: 33329, ratio: 7.65 },
  { long: 175.667, lat: -40.946, name: "Waiarapa", number: 14, value: 3400, ratio: 7.013 },
  { long: 171.340, lat: -42.692, name: "West Coast", number: 15, value: 2250, ratio: 6.912 },
  { long: 175.029, lat: 39.933, name: "Whanganui", number: 16, value: 5406, ratio: 7.904 }
];

// Code to get data and load it into a variable to be accessed later 
var countrydata = [];
var percentagedata = [];
d3.csv("https://raw.githubusercontent.com/justinakoh/SWEN422-data/master/covid-vaccination-by-dhb-formatted.csv", function (data) {
  for (var i = 0; i < data.length; i++) {
    // Loading in data that shows the actual vaccination numbers
    countrydata.push({
      name: data[i].location,
      number: data[i].number
    })

    // Loading in the percentage of population fully vaccinated 
    percentagedata.push({
      name: data[i].location,
      number: data[i].percentage
    })
  }
})

// Load external data and boot
d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson", function (data) {

  // Filter data to only show NZ on the screen
  data.features = data.features.filter(function (d) { return d.properties.name == "New Zealand" })

  // Draw the map
  svg.append("g")
    .selectAll("path")
    .data(data.features)
    .enter()
    .append("path")
    .attr("fill", "#b8b8b8")
    .attr("d", d3.geoPath()
      .projection(projection)
    )
    .style("stroke", "black")
    .style("opacity", .3)

  var lastcity
  var lastnumber
  let timesclicked = 1

  // Start of code that controls what happens when you interact with the screen i.e. mouseclick, mousemove etc. 
  var mouseover = function (d) {
    tooltip
      .transition()
      .duration(200)
      .style("opacity", 1)

    // Making all the circles the same colour
    d3.selectAll('circle')
      .style('fill', 'grey')

    // Highlighting the dot selected 
    d3.select(this)
      .style('fill', 'orange')

    // Make a tooltip appear next to where you are hovering over
    if (showingnumber) {  // This is rendered when the user wants to see the actual numbers
      tooltip
        .html(
          "<span style='color:grey'>Location: </span>" + d.name + "<br><span style='color:grey'> Vaccination Number: </span> " + countrydata[d.number].number
        )
        .style("background", "white")
        .style("left", (d3.mouse(this)[0] + 30) + "px")
        .style("top", (d3.mouse(this)[1] + 30) + "px")
        .style("position", "absolute")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")

      for (var i = 0; i < countrydata.length; i++) {
        if (countrydata[i].name = d) {
          vaccination = countrydata[i].number
        }
      }
    }
    // This is rendered when the user wants to see the percentages
    else {
      tooltip
        .html(
          "<span style='color:grey'>Location: </span>" + d.name + "<br><span style='color:grey'> Vaccination Rate: </span> " + percentagedata[d.number].number + "%"
        )
        .style("background", "white")
        .style("left", (d3.mouse(this)[0] + 30) + "px")
        .style("top", (d3.mouse(this)[1] + 30) + "px")
        .style("position", "absolute")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
      for (var i = 0; i < percentagedata.length; i++) {
        if (percentagedata[i].name = d) {
          vaccination = percentagedata[i].number
        }
      }
    }
  }

  // Function called when your mouse moves over a circle
  var mousemove = function (d) {
    tooltip
      .style("left", (d3.mouse(this)[0] + 30) + "px")
      .style("top", (d3.mouse(this)[1] + 30) + "px")
  }

  // Function that is called when your mouse leaves a circle
  var mouseleave = function (d) {
    tooltip
      .transition()
      .duration(200)
      .style("opacity", 0)

    // Making all the circles the same colour
    d3.selectAll('circle').style('fill', 'grey')
  }

  // Function called when you click on a circle: When you click on two circles, you should show the difference between the two places
  var mouseclick = function (d) {
    // Clicked twice already, display information comparing the two places. 
    if (timesclicked == 2) {
      timesclicked = 0;

      if (showingnumber) {
        // This is removing the commas from the numbers so that maths can be done
        var number = parseFloat(countrydata[lastnumber].number.replace(/,/g, '')) - parseFloat(countrydata[d.number].number.replace(/,/g, ''));
        var difference = Math.abs(number)

        // Showing the tooltip
        comparetip
          .style("visibility", "visible")
          .style("background-color", "white")
          .html(
            "<span style='color:grey'>Location: </span>"
            + d.name + " DHB and " + lastcity + " DHB "
            + "<br><span style='color:grey'> Vaccination Rate: </span> "
            + countrydata[d.number].number + " and " + countrydata[lastnumber].number
            + "<br><span style='color:grey'> Difference in vaccination numbers: </span> "
            + difference
          )
      }
      else {
        // This is removing the commas from the numbers so that maths can be done
        var number = parseFloat(percentagedata[lastnumber].number.replace(/,/g, '')) - parseFloat(percentagedata[d.number].number.replace(/,/g, ''));
        var difference = Math.abs(number).toPrecision(4)

        // Showing the tooltip
        comparetip
          .style("visibility", "visible")
          .style("background-color", "white")
          .html(
            "<span style='color:grey'>Location: </span>"
            + d.name + " DHB and " + lastcity + " DHB "
            + "<br><span style='color:grey'> Vaccination Rate: </span> "
            + percentagedata[d.number].number + "% and " + percentagedata[lastnumber].number + "%"
            + "<br><span style='color:grey'> Difference in vaccination percentage: </span> "
            + difference + "%"
          )
      }
    }
    else {
      lastcity = d.name
      lastnumber = d.number

      // Clearing the tooltip
      comparetip
        .style("visibility", "hidden")
    }
    timesclicked++;
  }


  // Start of code that renders the stuff on the page
  svg
    .selectAll("myCircles")
    .data(markers)
    .enter()
    .append("circle") // This draws the circles 
    .attr("cx", function (d) {
      return projection(
        [d.long, d.lat])[0]
    })
    .attr("cy", function (d) {
      return projection(
        [d.long, d.lat])[1]
    })
    // Determines the size of the circles that are rendered on the map 
    .attr("r", function (d) {
      return (
        0.0005 * d.value
      )
    })
    // Drawing the circle
    .attr("class", "circle")
    .style("fill", "#69A2B3")
    .attr("stroke", "#69A2B3")
    .attr("stroke-width", 3)
    .attr("fill-opacity", .4)

    // Interacting with the circles / map
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)
    .on("click", mouseclick)
})