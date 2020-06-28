// @TODO: YOUR CODE HERE!
function makeResponsive() {
    
    // if the SVG area isn't empty when the browser loads,
    // remove it and replace it with a resized version of the chart
    var svgArea = d3.select("body").select("svg");

    // clear svg is not empty
    if (!svgArea.empty()) {
        svgArea.remove();
    }

    var svgWidth = window.innerWidth;
    var svgHeight = window.innerHeight;

    var margin = {
    top: 20,
    right: 100,
    bottom: 80,
    left: 100
    };

    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    // Create an SVG wrapper, append an SVG group that will hold our chart,
    // and shift the latter by left and top margins.
    var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

    // Append an SVG group
    var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);
    // Function for updating the X-scale
    function xScale(data, selectedX) { // Create the X-axis scale

        // Create scale
        var xLinScale = d3.scaleLinear()
            .domain([d3.min(data, d => d[selectedX]) * 0.95,
            d3.max(data, d => d[selectedX]) * 1.05])
            .range([0, width]);
        
            return xLinScale;
    }

    // Function for updating the Y-scale
    function yScale(data, selectedY) { // Create the Y-axis scale

        // Create scale
        var yLinScale = d3.scaleLinear()
            .domain([d3.min(data, d => d[selectedY]) * 0.95,
            d3.max(data, d => d[selectedY]) * 1.05])
            .range([height, 0]);

            return yLinScale;
    }

    function axeX(newX, xAxis) {
        var bottomAxis = d3.axisBottom(newX);

        xAxis.transition()
            .duration(500)
            .call(bottomAxis);

        return xAxis;
    }

    function axeY(newY, yAxis) {
        var leftAxis = d3.axisLeft(newY);

        yAxis.transition()
            .duration(500)
            .call(leftAxis);
        
        return yAxis;
    }

    function circlesX(circlesGroup, newX, selectedX) {

        circlesGroup.transition()
            .duration(500)
            .attr("cx", d => newX(d[selectedX]));

        return circlesGroup
    }

    function circlesY(circlesGroup, newY, selectedY) {

        circlesGroup.transition()
            .duration(500)
            .attr("cy", d => newY(d[selectedY]));

        return circlesGroup
    }

    function textX(textGroup, newX, selectedX) {
        textGroup.transition()
            .duration(500)
            .attr("x", d => newX(d[selectedX]));

        return textGroup;
    }

    function textY(textGroup, newY, selectedY) {
        textGroup.transition()
            .duration(500)
            .attr("y", d => newY(d[selectedY])+5);

        return textGroup;
    }

    function xTip(selectedX) {
        var xlabel;

        if (selectedX === "poverty") {
            xlabel = "Poverty";
        }
        else if (selectedX === "age") {
            xlabel = "Median Age";
        }
        else if (selectedX === "income") {
            xlabel = "House Income";
        }

        return xlabel;
    }

    function yTip(selectedY) {
        var ylabel;

        if (selectedY === "obesity") {
            ylabel = "Obesity";
        }
        else if (selectedY === "smokes") {
            ylabel = "Smokers";
        }
        else if (selectedY === "healthcare") {
            ylabel = "Healthcare Lack";
        }

        return ylabel;
    }

    function newToolTip(selectedX, selectedY, circlesGroup) {
        var xlabel = xTip(selectedX);
        var ylabel = yTip(selectedY);

        var toolTip = d3.tip()
            .attr("class", "d3-tip")
            .offset([80, -60])
            .html(function(d) {
                return(`<strong>${d.state}<strong><br>${xlabel}: ${d[selectedX]}<br>${ylabel}: ${d[selectedY]}`);
            });

        circlesGroup.call(toolTip);

        circlesGroup.on("mouseover", function(data) {
        toolTip.show(data);
        // console.log(data);
        })
        // onmouseout event
        .on("mouseout", function(data, index) {
            toolTip.hide(data);
        });

        return circlesGroup;
    }

    // Initial Params
    var selectedX = "poverty";
    var selectedY = "obesity";

    // Read CSV
    d3.csv("../StarterCode/assets/data/data.csv").then(function(data, err) {
        if (err) throw err;

        data.forEach(function(data) {
            data.poverty = +data.poverty;
            data.age = +data.age;
            data.income = +data.income;
            data.obesity = +data.obesity;
            data.smokes = +data.smokes;
            data.healthcare = +data.healthcare;
        });

        // Call scale functions
        var xLinScale = xScale(data, selectedX);
        var yLinScale = yScale(data, selectedY);

        // Create axis functions
        var bottomAxis = d3.axisBottom(xLinScale);
        var leftAxis = d3.axisLeft(yLinScale);

        // Append axis
        var xAxis = chartGroup.append("g")
            //.classed(, true)
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);
        
        var yAxis = chartGroup.append("g")
            .call(leftAxis);

        //
        var cirlceText = chartGroup.selectAll("circle")
        .data(data)
        .enter();

        // append initial circles
        var circlesGroup = cirlceText
            // .selectAll("circle")
            // .data(data)
            // .enter()
            .append("circle")
            .attr("cx", d => xLinScale(d[selectedX]))
            .attr("cy", d => yLinScale(d[selectedY]))
            .attr("r", d => 15)
            .classed("stateCircle", "true")
            .attr("opacity", ".5");

        var textGroup = cirlceText
            // .selectAll(".states")
            // .data(data)
            // .enter()
            .append("text")
            .classed("states", true)
            .attr("x", d => xLinScale(d[selectedX]))
            .attr("y", d => yLinScale(d[selectedY])+5)
            .text(function(d) {
                return d.abbr;
            })
            .attr("font-size", "10px")
            .classed("stateText", true);

        // Create group for two x-axis labels
        var xlabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${width / 2}, ${height + 20})`);
        
        var povertyP = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty") // value to grab for event listener
            .classed("active", true)
            .text("Poverty [%]");
        
        var ageM = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "age") // value to grab for event listener
            .classed("inactive", true)
            .text("Median Age [Years]");
        
        var incomeH = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("value", "income") // value to grab for event listener
            .classed("inactive", true)
            .text("Median House Income [US$]");


        var ylabelsGroup = chartGroup.append("g");

        var obesityP = ylabelsGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left + 20)
            .attr("x", 0 - (height / 2))
            .attr("value", "obesity")
            .classed("active", true)
            .text("Obesity [%]");
        
        var smokersP = ylabelsGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left + 40)
            .attr("x", 0 - (height / 2))
            .attr("value", "smokes")
            .classed("inactive", true)
            .text("Smokers [%]");
        
        var healthP = ylabelsGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left + 60)
            .attr("x", 0 - (height / 2))
            .attr("value", "healthcare")
            .classed("inactive", true)
            .text("Healthcare Lack [%]");

        // Update Tool Tip function

        var circlesGroup = newToolTip(selectedX, selectedY, circlesGroup);

        xlabelsGroup.selectAll("text")
            .on("click", function() {
                var value = d3.select(this).attr("value");
                if (value !== selectedX) {
                    selectedX = value; // Updates x-value selection
                    xLinScale = xScale(data, selectedX) // Update x-scale for new data
                    xAxis = axeX(xLinScale, xAxis); // Updates x-axis
                    circlesGroup = circlesX(circlesGroup, xLinScale, selectedX); // Update circles with new x-values
                    textGroup = textX(textGroup, xLinScale, selectedX);
                    circlesGroup = newToolTip(selectedX, selectedY, circlesGroup); // Update tool tips
                    if (selectedX === "poverty") {
                        povertyP
                            .classed("active", true)
                            .classed("inactive", false);
                        ageM
                            .classed("active", false)
                            .classed("inactive", true);
                        incomeH
                            .classed("active", false)
                            .classed("inactive", true);
                    }
                    else if (selectedX === "age") {
                        povertyP
                            .classed("active", false)
                            .classed("inactive", true);
                        ageM
                            .classed("active", true)
                            .classed("inactive", false);
                        incomeH
                            .classed("active", false)
                            .classed("inactive", true);
                    }
                    else {
                        povertyP
                            .classed("active", false)
                            .classed("inactive", true);
                        ageM
                            .classed("active", false)
                            .classed("inactive", true);
                        incomeH
                            .classed("active", true)
                            .classed("inactive", false);
                    }
                }
            });
            ylabelsGroup.selectAll("text")
            .on("click", function() {
                var value = d3.select(this).attr("value");
                if (value !== selectedY) {
                    selectedY = value; // Updates y-value selection
                    yLinScale = yScale(data, selectedY) // Update y-scale for new data
                    yAxis = axeY(yLinScale, yAxis); // Updates y-axis
                    circlesGroup = circlesY(circlesGroup, yLinScale, selectedY); // Update circles with new x-values
                    textGroup = textY(textGroup, yLinScale, selectedY);
                    circlesGroup = newToolTip(selectedX, selectedY, circlesGroup); // Update tool tips
                    if (selectedY === "obesity") {
                        obesityP
                            .classed("active", true)
                            .classed("inactive", false);
                        smokersP
                            .classed("active", false)
                            .classed("inactive", true);
                        healthP
                            .classed("active", false)
                            .classed("inactive", true);
                    }
                    else if (selectedY === "smokes") {
                        obesityP
                            .classed("active", false)
                            .classed("inactive", true);
                        smokersP
                            .classed("active", true)
                            .classed("inactive", false);
                        healthP
                            .classed("active", false)
                            .classed("inactive", true);
                    }
                    else {
                        obesityP
                            .classed("active", false)
                            .classed("inactive", true);
                        smokersP
                            .classed("active", false)
                            .classed("inactive", true);
                        healthP
                            .classed("active", true)
                            .classed("inactive", false);
                    }
                }
            });
    }).catch(function(error) {
        console.log(error)
    });
}

makeResponsive();

d3.select(window).on("resize", makeResponsive);
