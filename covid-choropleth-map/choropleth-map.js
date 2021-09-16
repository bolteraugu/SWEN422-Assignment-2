//Sources I used in my code
//https://www.d3-graph-gallery.com/graph/choropleth_basic.html - Choropleth map 
//https://www.d3-graph-gallery.com/graph/choropleth_hover_effect.html - Hover effect on Choropleth map
//https://www.d3-graph-gallery.com/graph/interactivity_button.html - Adding dropdown (select) using D3
//https://bl.ocks.org/vasturiano/f821fc73f08508a3beeb7014b2e4d50f - Zoom and map and pan

//Canvas margins (got help from Ahad for this code)
var margin = {top: 10, right: 30, bottom: 30, left: 30}
width = window.innerWidth
height = window.innerHeight;

// Appending the svg and setting it's dimensions
var svg = d3.select("#my_dataviz").append('svg').attr("width", width/1.01).attr("height", height/1.03);

//Create the projection
var projection = d3.geoMercator()
    .scale(140) //Making the map bigger but not too big (i.e. the whole map can be viewed at the same time).
    .translate([width/2, height/2]); //Moving the map so it is in the correct position

// Map and projection
var path = d3.geoPath().projection(projection);

//The graphics canvas for the Total COVID cases per 100,000 map
const g = svg.append('g');

//The graphics canvas for the Total COVID deaths per 100,000 map
const g_deaths = svg.append('g');

/**Getting the zoom functionality from d3.zoom(), scaleExtent means the scale can be zoomed in a max of 24 times and can be zoomed out a max of 24 times.
 The scale extent was set because at 1 (default scale) the whole map can be seen so there is no need to zoom out further, and at 24 it is zoom in enough to easily see the smallest
 countries. Added event listener to the zoom, based on the "zoom" event that executes the 'zoomed' function whenever the user zooms (mouse wheel) or pans (mouse drag)*/
const zoom = d3.zoom()
    .scaleExtent([1, 24])
    .on("zoom", zoomed);

//Adds zoom functionality to svg.
svg.call(zoom);

var showCases = true; //Toggle variable between showing the COVID cases and COVID deaths, true = COVID Cases, false = COVID deaths.

/** This function applies transformations to the map (changing scale and/or translating) when the 'zoom' event is called.  */
function zoomed() {
    //If we are showing the COVID cases then only transform the COVID cases graphics canvas
    if (showCases) {
        g
            .selectAll('path') // To prevent stroke width from scaling
            .attr('transform', d3.event.transform);
    }
    //Otherwise transform the COVID deaths graphics canvas
    else {
        g_deaths
            .selectAll('path') // To prevent stroke width from scaling
            .attr('transform', d3.event.transform);
    }
}

//Canvas background
g.append("rect")
    .attr("width", width* 1)
    .attr("height", height*1.1)
    .attr("fill", "#bdbdbd")

// Establishing data maps, data for COVID cases, and data_deaths for COVID deaths.
var data = d3.map();
var data_deaths = d3.map();

var names = []; //For storing the countries names

//Create color scales (one for COVID cases and one for COVID deaths), blues for Cases, reds for Deaths.
var colorScale = d3.scaleThreshold()
    .domain([140, 550, 2500, 5710, 8800, 20139])
    .range(d3.schemeBlues[7]);

var colorScaleDeaths = d3.scaleThreshold()
    .domain([1.14, 8.25, 33, 80, 157, 601])
    .range(d3.schemeReds[7]);

//Ahad created a public repo to store our data (hence the URL format). This is grabbing the names from the cleaned CSV COVID cases data.
d3.csv("https://raw.githubusercontent.com/ahadrahman/SWEN422-Assignment-2-Data/main/cleaned_cases_data_for_map_vis.csv",
    //Function to grab the names and related country codes
    function(data) {
        for (var i = 0; i < data.length; i++) {
            names.push({
                code: data[i].code,
                name: data[i].name
            })
        }
    });

// Loading the external data and boot the program
d3.queue()
    .defer(d3.json, "https://raw.githubusercontent.com/ahadrahman/SWEN422-Assignment-2-Data/main/world.geojson")
    .defer(d3.csv, "https://raw.githubusercontent.com/ahadrahman/SWEN422-Assignment-2-Data/main/cleaned_cases_data_for_map_vis.csv",
        function(d) {
            data.set(d.code, +d.cases)
        })
    .defer(d3.json, "https://raw.githubusercontent.com/ahadrahman/SWEN422-Assignment-2-Data/main/world.geojson")
    .defer(d3.csv, "https://raw.githubusercontent.com/ahadrahman/SWEN422-Assignment-2-Data/main/cleaned_deaths_data_for_map_vis.csv",
        function(d) {
            data_deaths.set(d.code, +d.deaths)
        })
    .await(ready);

function ready(error, topo) {

    //This code is used to create the map's hover functionality.
    let mouseOver = function(d) {
        //Getting mouse coordinates
        var x = d3.mouse(this)[0];
        var y = d3.mouse(this)[1];

        //Getting name of country that is being hovered
        var name;
        for (let i = 0; i < names.length; i++) {
            if (names[i].code === d.id) {
                name = names[i].name
            }
        }

        //Fading all countries
        if (showCases) {
            d3.selectAll(".Country")
                .transition()
                .duration(200)
                .style("opacity", .5)
        }
        else {
            d3.selectAll(".Country_deaths")
                .transition()
                .duration(200)
                .style("opacity", .5)
        }

        //Then highlighting hovered country by showing it in full opacity with a border 
        d3.select(this)
            .transition()
            .duration(200)
            .style("opacity", 1)
            .style("stroke", "black");

        //Getting the number of digits for the COVID cases so I can calculate how big the hover information container should be.
        var casesLength;
        if (showCases) {
            casesLength = data.get(d.id).toString().length;
        }
        else {
            casesLength = data_deaths.get(d.id).toString().length;
        }
        //Getting the length of the name too
        var nameLength = name.length;

        /*Setting the hover information container size based on whether the cases length or name length is longer. Also setting the position of it based on mouse coordinates, and making
        the container visible. */
        if (showCases) {
            if (casesLength + 46 >= nameLength) { //The +46 is because the "Total number of cases per 100,000 population: " text before the COVID cases text.
                focusRect.attr("x", x + (width * 0.02))
                    .attr("y", y + (height * 0.02))
                    .attr("width", width * (0.00475 * (casesLength + 46)))
                    .attr("visibility", "visible")
            }
            else {
                focusRect.attr("x", x + (width * 0.02))
                    .attr("y", y + (height * 0.02))
                    .attr("width", width * (0.0050 * name.length))
                    .attr("visibility", "visible")
            }
            //Adding the hover information to the container (country name and number of COVID cases)
            focusCountryText
                .attr("x", x + (width * 0.025))
                .attr("y", y + (height * 0.035))
                .attr("visibility", "visible")
                .text(name)
                .style("fill", "white")
            focusCasesText
                .attr("x", x + (width * 0.025))
                .attr("y", y + (height * 0.060))
                .attr("visibility", "visible")
                .text("Total number of cases per 100,000 population: " + data.get(d.id))
                .style("fill", "white");
        }
        //Same thing as above but for COVID deaths.
        else {
            if (casesLength + 46 >= nameLength) {
                focusRectDeaths.attr("x", x + (width * 0.02))
                    .attr("y", y + (height * 0.02))
                    .attr("width", width * (0.00485 * (casesLength + 46)))
                    .attr("visibility", "visible")
            }
            else {
                focusRectDeaths.attr("x", x + (width * 0.02))
                    .attr("y", y + (height * 0.02))
                    .attr("width", width * (0.0051 * name.length))
                    .attr("visibility", "visible")
            }
            focusCountryTextDeaths
                .attr("x", x + (width * 0.025))
                .attr("y", y + (height * 0.035))
                .attr("visibility", "visible")
                .text(name)
                .style("fill", "white")
            focusCasesTextDeaths
                .attr("x", x + (width * 0.025))
                .attr("y", y + (height * 0.060))
                .attr("visibility", "visible")
                .text("Total number of deaths per 100,000 population: " + data_deaths.get(d.id))
                .style("fill", "white");
        }

    }

    //Function for when country is becoming not hovered
    let mouseLeave = function(d) {
        //Set opacities of all the countries back to the default opacity and remove the borders from all of them as well. 
        if (showCases) {
            d3.selectAll(".Country")
                .transition()
                .duration(200)
                .style("opacity", .8)
                .style("stroke", "transparent")
        }
        else {
            d3.selectAll(".Country_deaths")
                .transition()
                .duration(200)
                .style("opacity", .8)
                .style("stroke", "transparent")
        }

        d3.select(this)
            .transition()
            .duration(200)
            .style("opacity", .8)
            .style("stroke", "transparent")

        //Hide hovered container and information.
        focusRect.attr("visibility", "hidden")
        focusCountryText.attr("visibility", "hidden")
        focusCasesText.attr("visibility", "hidden")
        focusRectDeaths.attr("visibility", "hidden")
        focusCountryTextDeaths.attr("visibility", "hidden")
        focusCasesTextDeaths.attr("visibility", "hidden")
    }

    //Drawing the COVID cases map
    g
        .selectAll("path")
        .data(topo.features)
        .enter()
        .append("path")
        //Draw each country
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        //Set the color of each country
        .attr("fill", function (d) {
            d.total = data.get(d.id) || 0;
            return colorScale(d.total);
        }).style("stroke", "transparent")
        .attr("class", function(d){ return "Country" } ) //Setting class so we can reference the countries.
        .style("opacity", .8) //Default opacity.
        .style("visibility", "visible")
        //Adding event listeners
        .on("mouseover", mouseOver )
        .on("mouseleave", mouseLeave );

    //Drawing the COVID deaths map
    g_deaths
        .selectAll("path")
        .data(topo.features)
        .enter()
        .append("path")
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        .attr("fill", function (d) {
            d.total = data_deaths.get(d.id) || 0;
            return colorScaleDeaths(d.total);
        }).style("stroke", "transparent")
        .attr("class", function(d){ return "Country_deaths" } )
        .style("opacity", .8)
        .style("visibility", "hidden") //COVID Deaths map is hidden on visualisation startup
        .on("mouseover", mouseOver )
        .on("mouseleave", mouseLeave );

    //Creating backgrounds for the maps' legends.
    g.append('rect').attr("x", width * 0.842)
        .attr("y", height * 0.03)
        .attr("width", width * 0.13)
        .attr("height", height * 0.37)
        .attr("class", function(d){ return "Legend_cases" } )
        .attr("style", "outline: thin solid black")
        .style("visibility", "visible")
        .style("fill", "#878787")

    g_deaths.append('rect').attr("x", width * 0.842)
        .attr("y", height * 0.03)
        .attr("width", width * 0.133)
        .attr("height", height * 0.37)
        .attr("class", function(d){ return "Legend_deaths" } )
        .attr("style", "outline: thin solid black")
        .style("visibility", "hidden")
        .style("fill", "#878787")

    //Adding legend headers
    g.append('text').attr("x", width * 0.846)
        .attr("y", height * 0.053)
        .attr("width", width * 0.03)
        .attr("height", height * 0.05)
        .attr("class", function(d){ return "Legend_cases" } )
        .text("Total number of COVID-19 Cases")
        .style("visibility", "visible")
        .style("fill", "#ffffff")
        .style("font-weight", "bold")
        .style("font-size", "15px")
    
    g.append('text').attr("x", width * 0.866)
        .attr("y", height * 0.073)
        .attr("width", width * 0.03)
        .attr("height", height * 0.05)
        .attr("class", function(d){ return "Legend_cases" } )
        .text("per 100,000 population")
        .style("visibility", "visible")
        .style("fill", "#ffffff")
        .style("font-weight", "bold")
        .style("font-size", "15px")

    g_deaths.append('text').attr("x", width * 0.846)
        .attr("y", height * 0.053)
        .attr("width", width * 0.03)
        .attr("height", height * 0.05)
        .attr("class", function(d){ return "Legend_deaths" } )
        .text("Total number of COVID-19 Deaths")
        .style("visibility", "hidden")
        .style("fill", "#ffffff")
        .style("font-weight", "bold")
        .style("font-size", "15px")

    g_deaths.append('text').attr("x", width * 0.866)
        .attr("y", height * 0.073)
        .attr("width", width * 0.03)
        .attr("height", height * 0.05)
        .attr("class", function(d){ return "Legend_deaths" } )
        .text("per 100,000 population")
        .style("visibility", "hidden")
        .style("fill", "#ffffff")
        .style("font-weight", "bold")
        .style("font-size", "15px")

    //Establishing legend colors and ranges
    const colors = ["#eff3ff", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5"]
    const ranges = ["0 - 140", "141 - 550", "551 - 2500", "2501 - 5710", "5711 - 8800", "8801 - 20139"]

    const colors_deaths = ["#fee5d9", "#fcbba1", "#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d"]
    const ranges_deaths = ["0 - 1.14", "1.15 - 8.25", "8.26 - 33", "34 - 80", "81 - 157", "158 - 601"]

    //Drawing the legend keys
    for (var i = 0; i < 6; i++) {
        g.append('rect').attr("x", width * 0.9445)
            .attr("y", height * 0.01 * (i * 5) + (height * 0.095))
            .attr("width", width * 0.02)
            .attr("class", function(d){ return "Legend_cases" } )
            .style("visibility", "visible")
            .attr("height", height * 0.04)
            .style("fill", colors[i])

        g.append('text').attr("x", width * 0.8485)
            .attr("y", height * 0.04 * (i*1.25) + (height * 0.118))
            .attr("width", width * 0.03)
            .attr("height", height * 0.05)
            .attr("class", function(d){ return "Legend_cases" } )
            .style("visibility", "visible")
            .text(ranges[i] + " Cases:")
            .style("font-size", "14px")
            .style("fill", "#ffffff")
    }

    for (var i = 0; i < 6; i++) {
        g_deaths.append('rect').attr("x", width * 0.9445)
            .attr("y", height * 0.01 * (i * 5) + (height * 0.095))
            .attr("width", width * 0.02)
            .attr("class", function(d){ return "Legend_deaths" } )
            .style("visibility", "hidden")
            .attr("height", height * 0.04)
            .style("fill", colors_deaths[i])

        g_deaths.append('text').attr("x", width * 0.8485)
            .attr("y", height * 0.04 * (i*1.25) + (height * 0.118))
            .attr("width", width * 0.03)
            .attr("height", height * 0.05)
            .attr("class", function(d){ return "Legend_deaths" } )
            .style("visibility", "hidden")
            .text(ranges_deaths[i] + " Deaths:")
            .style("font-size", "14px")
            .style("fill", "#ffffff")
    }

    //Drawing the switching between COVID cases and deaths container
    g.append('rect').attr("x", width * 0.012)
        .attr("y", height * 0.02)
        .attr("width", width * 0.21)
        .attr("height", height * 0.095)
        .attr("style", "outline: thin solid black")
        .attr("class", function(d){ return "Dropdown_cases" } )
        .style("visibility", "visible")
        .style("fill", "#878787")

    g_deaths.append('rect').attr("x", width * 0.012)
        .attr("y", height * 0.02)
        .attr("width", width * 0.21)
        .attr("height", height * 0.095)
        .attr("style", "outline: thin solid black")
        .attr("class", function(d){ return "Dropdown_deaths" } )
        .style("visibility", "hidden")
        .style("fill", "#878787")

    //Adding headers to the switching between COVID cases and deaths container
    g.append('text').attr("x", width * 0.022)
        .attr("y", height * 0.0535)
        .attr("width", width * 0.03)
        .attr("height", height * 0.05)
        .attr("class", function(d){ return "Dropdown_cases" } )
        .text("Show")
        .style("fill", "#ffffff")
        .style("visibility", "visible")
        .style("font-size", "20px")
        .style("font-weight", "bold")

    g_deaths.append('text').attr("x", width * 0.022)
        .attr("y", height * 0.0535)
        .attr("width", width * 0.03)
        .attr("height", height * 0.05)
        .attr("class", function(d){ return "Dropdown_deaths" } )
        .style("visibility", "hidden")
        .text("Show")
        .style("fill", "#ffffff")
        .style("font-size", "20px")
        .style("font-weight", "bold")

    //Creating a dropdown (select)
    var allGroup = ["Total number of COVID-19 cases per 100,000 population", "Total number of COVID-19 deaths per 100,000 population"] //Dropdown options
    //Appending a div to a div in index.html (my_dataviz) and styling it
    var div = d3.select("#my_dataviz").append("div")
    div.style("position", "absolute").style("left", (width * 0.025) + "px").style("top", (height * 0.075) + "px")
    //Appending a select to it and populating it.
    var dropDown = div.append("select")
    dropDown.selectAll('myOptions')
        .data(allGroup).enter()
        .append('option')
        .text(function (d) { return d; }) // text showed in the menu
        .attr("value", function (d) { return d; }) // corresponding value returned by the button

    //Code for toggling between COVID cases and deaths. 
    d3.selectAll("select").on("change", function(){ //Listening to the select value changing.
        /*If going from COVID cases to COVID deaths then hide the cases map (by hiding all the countries), the cases legend and the cases dropdown and show the equivalent death
        components */
        if(this.value === 'Total number of COVID-19 cases per 100,000 population') {
            d3.selectAll(".Country").style("visibility", "visible")
            d3.selectAll(".Legend_cases").style("visibility", "visible")
            d3.selectAll(".Dropdown_cases").style("visibility", "visible")
            d3.selectAll(".Legend_deaths").style("visibility", "hidden")
            d3.selectAll(".Dropdown_deaths").style("visibility", "hidden")
            d3.selectAll(".Country_deaths").style("visibility", "hidden")
            showCases = true;
        }
        //And vice-versa
        else {
            d3.selectAll(".Country").style("visibility", "hidden")
            d3.selectAll(".Legend_cases").style("visibility", "hidden")
            d3.selectAll(".Dropdown_cases").style("visibility", "hidden")
            d3.selectAll(".Legend_deaths").style("visibility", "visible")
            d3.selectAll(".Dropdown_deaths").style("visibility", "visible")
            d3.selectAll(".Country_deaths").style("visibility", "visible")
            showCases = false;
        }
    });

    //Creating the hover container and text variables (got some help from Ahad for this code)
    var focusRect = g
        .append('rect')
        .style("fill", "#333333")
        .attr("stroke", "black")
        .attr("height", height * 0.055)
        .attr('visibility', 'hidden')
        .style("opacity", 1)
    ;

    var focusCountryText = g
        .append('text')
        .style("opacity", 1)
        .style("font-size", "19px")
        .attr("text-anchor", "left")
        .attr("alignment-baseline", "middle");

    var focusCasesText = g
        .append('text')
        .style("opacity", 1)
        .style("font-size", "19px")
        .attr("text-anchor", "left")
        .attr("alignment-baseline", "middle");

    var focusRectDeaths = g_deaths
        .append('rect')
        .style("fill", "#333333")
        .attr("stroke", "black")
        .attr("height", height * 0.055)
        .attr('visibility', 'hidden')
        .style("opacity", 1)
    ;

    var focusCountryTextDeaths = g_deaths
        .append('text')
        .style("opacity", 1)
        .style("font-size", "19px")
        .attr("text-anchor", "left")
        .attr("alignment-baseline", "middle");

    var focusCasesTextDeaths = g_deaths
        .append('text')
        .style("opacity", 1)
        .style("font-size", "19px")
        .attr("text-anchor", "left")
        .attr("alignment-baseline", "middle");
}