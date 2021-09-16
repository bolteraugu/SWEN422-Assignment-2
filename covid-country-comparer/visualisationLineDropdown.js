/**
 * Sources:
 * https://www.d3-graph-gallery.com/graph/line_basic.html - Most basic line chart in d3.js
 * https://www.d3-graph-gallery.com/graph/line_select.html - Line plot with dropdown to select group in d3.js
 * https://www.d3-graph-gallery.com/graph/line_cursor.html - Line chart with cursor showing exact value
 * https://bl.ocks.org/larsenmtl/e3b8b7c2ca4787f77d78f58d41c3da91 - d3 mouseover multi-line chart
 * http://bl.ocks.org/lamchau/405f2d69fb3c80ad724a - D3.js: Barebones crosshair
 **/

let casesData = "https://raw.githubusercontent.com/ahadrahman/SWEN422-Assignment-2-Data/main/eris-cases-clean-data.csv";
let deathsData = "https://raw.githubusercontent.com/ahadrahman/SWEN422-Assignment-2-Data/main/eris-deaths-clean-data.csv";

//Set the dimensions and margins of the graph
var margin = {top: 10, right: 330, bottom: 30, left: 60},
    width = 1500 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

//Append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");


//Initialise x
var x = d3.scaleTime().range([0, width]);
var xAxisGroup = svg.append("g")
    .attr("transform", "translate(0," + height + ")")

//Initialise y
var y = d3.scaleLinear().range([height, 0]);
var yAxisGroup = svg.append("g").attr("class", "myYaxis")

//For the 5 dropdowns for selecting a country
var selectedCountry1 = "";
var selectedCountry2 = "";
var selectedCountry3 = "";
var selectedCountry4 = "";
var selectedCountry5 = "";
var selectedOptionArray = [];
var selectedOptionMap = new Map();


var parseDate = d3.timeParse("%m/%d/%y");


d3.select("#view").text("Viewing Covid Cases"); //Initial title with covid cases data


function update(selectedData) {
    //Read the data
    d3.csv(selectedData,

        function (data) {

            var allGroup = data.columns.slice(1); //Extracting column headers which are my countries

            //The 5 dropdowns
            d3.select("#selectButton1")
                .selectAll('myOptions')
                .data(allGroup)
                .enter()
                .append('option')
                .text(function (d) {
                    return d;
                }) //Text showed in the menu
                .attr("value", function (d) {
                    return d;
                }) //Corresponding value returned by the button

            d3.select("#selectButton2")
                .selectAll('myOptions')
                .data(allGroup)
                .enter()
                .append('option')
                .text(function (d) {
                    return d;
                }) //Text showed in the menu
                .attr("value", function (d) {
                    return d;
                }) //Corresponding value returned by the button

            d3.select("#selectButton3")
                .selectAll('myOptions')
                .data(allGroup)
                .enter()
                .append('option')
                .text(function (d) {
                    return d;
                }) //Text showed in the menu
                .attr("value", function (d) {
                    return d;
                }) //Corresponding value returned by the button

            d3.select("#selectButton4")
                .selectAll('myOptions')
                .data(allGroup)
                .enter()
                .append('option')
                .text(function (d) {
                    return d;
                }) //Text showed in the menu
                .attr("value", function (d) {
                    return d;
                }) //Corresponding value returned by the button

            d3.select("#selectButton5")
                .selectAll('myOptions')
                .data(allGroup)
                .enter()
                .append('option')
                .text(function (d) {
                    return d;
                }) //Text showed in the menu
                .attr("value", function (d) {
                    return d;
                }) //Corresponding value returned by the button


            //Parsing the Date
            data.forEach(function (d) {
                d.Date = parseDate(d.Date);
            });


            createAxis(data); //Initialise Axis

            //5 lines to draw data for countries
            var line = svg
                .append("g")
                .append("path")
                .attr("class", "line")

            var line2 = svg
                .append("g")
                .append("path")
                .attr("class", "line")

            var line3 = svg
                .append("g")
                .append("path")
                .attr("class", "line")

            var line4 = svg
                .append("g")
                .append("path")
                .attr("class", "line")

            var line5 = svg
                .append("g")
                .append("path")
                .attr("class", "line")


            //Get the data for the selected country, return a map of the data
            function getCountryData(selectedCountry) {
                return data.map(function (d) {
                    return {Date: d.Date, value: d[selectedCountry]}
                });
            }


            //Mouse Hover
            //Create the text that travels with the cross hair
            var focusText = svg
                .append('g')
                .append('text')
                .style("opacity", 1)
                .attr("text-anchor", "left")
                .attr("alignment-baseline", "middle")
                .style("font-size", "12px")
                .style("stroke", "gray")

            var mouseG = svg.append("g")
                .attr("class", "mouse-over-effects");

            var crossHair = mouseG.attr("class", "crosshair");
            crossHair.append("path")
                .attr("id", "h_crosshair") //Horizontal cross hair
                .style("stroke", "gray")
                .style("stroke-width", "1px")
                .style("stroke-dasharray", "5,5")
                .style("display", "none");

            crossHair.append("path")
                .attr("id", "v_crosshair") //Vertical cross hair
                .style("stroke", "gray")
                .style("stroke-width", "1px")
                .style("stroke-dasharray", "5,5")
                .style("display", "none");

            mouseG.append('svg:rect') //Append a rect to catch mouse movements on canvas
                .attr('width', width) //Can't catch mouse events on a g element
                .attr('height', height)
                .attr('fill', 'none')
                .attr('pointer-events', 'all')
                .on('mouseout', function() { //Hide cross hair lines and text when mouse goes off screen
                    d3.select("#v_crosshair")
                        .style("opacity", 0);
                    d3.select("#h_crosshair")
                        .style("opacity", 0);
                    focusText.style("opacity", 0)
                })
                .on('mouseover', function() { //Show cross hair lines and text when mouse in on the screen
                    d3.select("#v_crosshair")
                        .style("opacity", 1);
                    d3.select("#h_crosshair")
                        .style("opacity", 1);
                    focusText.style("opacity", 1)
                })
                .on('mousemove', function() { //Mouse moving over canvas
                    var x0 = x.invert(d3.mouse(mouseG.node())[0]);
                    var y0 = y.invert(d3.mouse(mouseG.node())[1]);

                    //Drawing the cross hair lines
                    var mouse = d3.mouse(this);
                    d3.select("#v_crosshair")
                        .attr("d", function () { //This draws the path for the vertical line
                            var d = "M" + mouse[0] + "," + height;
                            d += " " + mouse[0] + "," + 0;
                            return d;
                        })
                        .style("display", "block");

                    d3.select("#h_crosshair")
                        .attr("d", function () { //This draws the path for the horizontal line
                            var d = "M" + width + "," + mouse[1];
                            d += " " + 0 + "," + mouse[1];
                            return d;
                        })
                        .style("display", "block");

                    focusText
                        .html(x0.toDateString() + " : " + Math.round(y0).toLocaleString())
                        .attr("x", x(x0) + 5)
                        .attr("y", y(y0) - 10)
                });

            //A function that updates the chart
            function updateGraph(selectedCountry, selectedGroup, groupNo) {

                //When there are multiple countries selected, find which country has the biggest y value range
                function getCountryWithMaxValue(selectedGroup) {
                    let maxValues = new Map();
                    selectedGroup.forEach(group => {
                        let tempValues = []
                        getCountryData(group).forEach(entry => {
                            tempValues.push(entry.value)
                            maxValues.set(group, (Math.max(...tempValues)))
                        })
                    })
                    let max = Math.max(...maxValues.values());
                    let maxValuesObject = Object.fromEntries(maxValues)
                    return Object.keys(maxValuesObject).find(key => maxValuesObject[key] === max);
                }

                //This will update the yAxis with the country with the biggest Y range,
                //And then redraws the lines to match the new yAxis
                d3.select("#updateYaxis").on("click", function () {
                    y.domain([0, d3.max(data, function (d) {
                        let country = getCountryWithMaxValue(selectedGroup)
                        return +d[country];
                    })])
                    yAxisGroup.transition().duration(1000).call(d3.axisLeft(y));
                    redraw()
                })

                drawLines(groupNo, selectedCountry)

                function redraw() {
                    selectedOptionMap.forEach(function (val, key) {
                        drawLines(key, val)
                    })
                }

                function drawLines(groupNo, selectedCountry) {
                    switch (groupNo) {
                        case 1:
                            line
                                .datum(getCountryData(selectedCountry))
                                .transition()
                                .duration(1000)
                                .attr("d", d3.line()
                                    .curve(d3.curveMonotoneX)
                                    .defined(function(d) {
                                        return d.value != 0;
                                    })
                                    .x(function (d) {
                                        return x(+d.Date)
                                    })
                                    .y(function (d) {
                                        return y(+d.value)
                                    })
                                )
                                .attr("stroke", "indianred")
                                .style("stroke-width", 1)
                                .style("fill", "none")

                            d3.select("#c1")
                                .text(selectedCountry)

                            break
                        case 2:
                            line2
                                .datum(getCountryData(selectedCountry))
                                .transition()
                                .duration(1000)
                                .attr("d", d3.line()
                                    .curve(d3.curveMonotoneX)
                                    .defined(function(d) {
                                        return d.value != 0;
                                    })
                                    .x(function (d) {
                                        return x(+d.Date)
                                    })
                                    .y(function (d) {
                                        return y(+d.value)
                                    })
                                )
                                .attr("stroke", "mediumslateblue")
                                .style("stroke-width", 1)
                                .style("fill", "none")

                            d3.select("#c2")
                                .text(selectedCountry)
                            break
                        case 3:
                            line3
                                .datum(getCountryData(selectedCountry))
                                .transition()
                                .duration(1000)
                                .attr("d", d3.line()
                                    .curve(d3.curveMonotoneX)
                                    .defined(function(d) {
                                        return d.value != 0;
                                    })
                                    .x(function (d) {
                                        return x(+d.Date)
                                    })
                                    .y(function (d) {
                                        return y(+d.value)
                                    })
                                )
                                .attr("stroke", "steelblue")
                                .style("stroke-width", 1)
                                .style("fill", "none")

                            d3.select("#c3")
                                .text(selectedCountry)
                            break
                        case 4:
                            line4
                                .datum(getCountryData(selectedCountry))
                                .transition()
                                .duration(1000)
                                .attr("d", d3.line()
                                    .curve(d3.curveMonotoneX)
                                    .defined(function(d) {
                                        return d.value != 0;
                                    })
                                    .x(function (d) {
                                        return x(+d.Date)
                                    })
                                    .y(function (d) {
                                        return y(+d.value)
                                    })
                                )
                                .attr("stroke", "green")
                                .style("stroke-width", 1)
                                .style("fill", "none")

                            d3.select("#c4")
                                .text(selectedCountry)
                            break
                        case 5:
                            line5
                                .datum(getCountryData(selectedCountry))
                                .transition()
                                .duration(1000)
                                .attr("d", d3.line()
                                    .curve(d3.curveMonotoneX)
                                    .defined(function(d) {
                                        return d.value != 0;
                                    })
                                    .x(function (d) {
                                        return x(+d.Date)
                                    })
                                    .y(function (d) {
                                        return y(+d.value)
                                    })
                                )
                                .attr("stroke", "rebeccapurple")
                                .style("stroke-width", 1)
                                .style("fill", "none")

                            d3.select("#c5")
                                .text(selectedCountry)
                            break
                        default:
                            console.log("ERROR")
                    }
                }
            }


            //When the button is changed, run the updateChart function
            d3.select("#selectButton1").on("change", function (d) {
                var selectedOption = d3.select(this).property("value") // recover the option that has been chosen

                // Remove the old selection
                const index = selectedOptionArray.indexOf(selectedCountry1)
                if (index > -1) selectedOptionArray.splice(index, 1)

                selectedCountry1 = selectedOption; // Save the new selection
                selectedOptionArray.push(selectedOption);

                if (selectedOptionMap.has(1)) selectedOptionMap.set(1, selectedCountry1)
                else selectedOptionMap.set(1, selectedCountry1);

                updateGraph(selectedCountry1, selectedOptionArray, 1); //Run the updateChart function with this selected option
            })

            d3.select("#selectButton2").on("change", function (d) {
                var selectedOption = d3.select(this).property("value") // recover the option that has been chosen

                // Remove the old selection
                const index = selectedOptionArray.indexOf(selectedCountry2)
                if (index > -1) selectedOptionArray.splice(index)

                selectedCountry2 = selectedOption; // Save the new selection
                selectedOptionArray.push(selectedOption); // And push that on to the array

                if (selectedOptionMap.has(2)) selectedOptionMap.set(2, selectedCountry2)
                else selectedOptionMap.set(2, selectedCountry2);

                updateGraph(selectedCountry2, selectedOptionArray, 2) //Run the updateChart function with this selected option
            })

            d3.select("#selectButton3").on("change", function (d) {
                var selectedOption = d3.select(this).property("value") // recover the option that has been chosen

                // Remove the old selection
                const index = selectedOptionArray.indexOf(selectedCountry3)
                if (index > -1) selectedOptionArray.splice(index)

                selectedCountry3 = selectedOption; // Save the new selection
                selectedOptionArray.push(selectedOption); // And push that on to the array

                if (selectedOptionMap.has(3)) selectedOptionMap.set(3, selectedCountry3)
                else selectedOptionMap.set(3, selectedCountry3);

                updateGraph(selectedCountry3, selectedOptionArray, 3) //Run the updateChart function with this selected option
            })

            d3.select("#selectButton4").on("change", function (d) {
                var selectedOption = d3.select(this).property("value") // recover the option that has been chosen

                // Remove the old selection
                const index = selectedOptionArray.indexOf(selectedCountry4)
                if (index > -1) selectedOptionArray.splice(index)

                selectedCountry4 = selectedOption; // Save the new selection
                selectedOptionArray.push(selectedOption); // And push that on to the array

                if (selectedOptionMap.has(4)) selectedOptionMap.set(4, selectedCountry4)
                else selectedOptionMap.set(4, selectedCountry4);

                updateGraph(selectedCountry4, selectedOptionArray, 4) //Run the updateChart function with this selected option
            })

            d3.select("#selectButton5").on("change", function (d) {
                var selectedOption = d3.select(this).property("value") // recover the option that has been chosen

                // Remove the old selection
                const index = selectedOptionArray.indexOf(selectedCountry5)
                if (index > -1) selectedOptionArray.splice(index)

                selectedCountry5 = selectedOption; // Save the new selection
                selectedOptionArray.push(selectedOption); // And push that on to the array

                if (selectedOptionMap.has(5)) selectedOptionMap.set(5, selectedCountry5)
                else selectedOptionMap.set(5, selectedCountry5);

                updateGraph(selectedCountry5, selectedOptionArray, 5) //Run the updateChart function with this selected option
            })
        })
}

function createAxis(data) {
    //Add X axis --> it is a date format
    x.domain(d3.extent(data, function (d) {
        return d.Date;
    }))
    xAxisGroup.transition().duration(1000).call(d3.axisBottom(x).ticks(12));

    //Add Y axis
    y.domain([0, d3.max(data, function (d) {
        return +d["Brazil"]; //placeholder
    })])
    yAxisGroup.transition().duration(1000).call(d3.axisLeft(y));
}

function clearGraph(data) {
    selectedCountry1 = "";
    selectedCountry2 = "";
    selectedCountry3 = "";
    selectedCountry4 = "";
    selectedCountry5 = "";
    selectedOptionArray = [];
    selectedOptionMap.clear();
    svg.selectAll("path").remove();

    d3.select("#c1").text("")
    d3.select("#c2").text("")
    d3.select("#c3").text("")
    d3.select("#c4").text("")
    d3.select("#c5").text("")

    d3.select("#selectButton1").property('value', "No Country Selected");
    d3.select("#selectButton2").property('value', "No Country Selected");
    d3.select("#selectButton3").property('value', "No Country Selected");
    d3.select("#selectButton4").property('value', "No Country Selected");
    d3.select("#selectButton5").property('value', "No Country Selected");

    createAxis(data);
}

function preUpdate(data) {
    let string = function (d) {
        if (data.toString() === casesData.toString()) return "Covid Cases"
        else return "Covid Deaths"
    }
    d3.select("#view").text("Viewing " + string())
    clearGraph(data);
    update(data);
}

update(casesData)
