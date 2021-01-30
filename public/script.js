const COLUMNS = 11;
const ROWS = 11;

const inBounds = ({ x, y }) => {
    return x >= 0 && x < COLUMNS && y >= 0 && y < ROWS;
}
const neighbourTiles = [
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: -1 },
    { x: 0, y: 1 },
]

function createGridData() {
    var data = new Array();
    var xpos = 1; //starting xpos and ypos at 1 so the stroke will show when we make the grid below
    var ypos = 1;
    var width = 50;
    var height = 50;

    // iterate for rows 
    for (var row = 0; row < ROWS; row++) {
        data.push(new Array());

        // iterate for cells/columns inside rows
        for (var column = 0; column < COLUMNS; column++) {
            const neighbours = neighbourTiles.reduce((acc, { x, y }) => {
                const newpos = { x: column + x, y: row + y };
                return inBounds(newpos) ?
                    [...acc, newpos] :
                    acc;
            }, []);
            data[row].push({
                xpos,
                ypos,
                x: column,
                y: row,
                width: width,
                height: height,
                nval: 0,
                neighbours
            })
            // increment the x position. I.e. move it over by 50 (width variable)
            xpos += width;
        }
        // reset the x position after a row is complete
        xpos = 1;
        // increment the y position for the next row. Move it down 50 (height variable)
        ypos += height;
    }
    return data;
}

const getColor = (d) => {
    if ((d) % 4 == 0) { return "#fff"; }
    if ((d) % 4 == 1) { return "#ff5"; }
    if ((d) % 4 == 2) { return "#fa2"; }
    if ((d) % 4 == 3) { return "#e40"; }
}

const gridData = createGridData();
const eventData = [];
var eventDataMax = 25;

var grid = d3.select("#grid")
    .append("svg")
    .attr("width", "561px")
    .attr("height", "561px");

var row = grid.selectAll(".row")
    .data(gridData)
    .enter().append("g")
    .attr("class", "row");

var column = row.selectAll(".square")
    .data(function (d) { return d; })
    .enter().append("g")
    .attr("class", "cell")
    .append("rect")
    .attr("class", "square")
    .attr("x", function (d) { return d.xpos; })
    .attr("y", function (d) { return d.ypos; })
    .attr("x-ix", function (d) { return d.x; })
    .attr("y-ix", function (d) { return d.y; })
    .attr("width", function (d) { return d.width; })
    .attr("height", function (d) { return d.height; })
    .style("fill", function (d) {
        return getColor(d.nval);
    })
    .style("stroke", "#222")
    .on('click', function (e) {
        e.preventDefault();
        const target = e.target
        const x = e.srcElement.getAttribute('x-ix')
        const y = e.srcElement.getAttribute('y-ix')
        updateColor({ x, y })
    })

var numbers = row.selectAll("cell")
    .data(function (d) { return d; })
    .enter().append("text")
    .attr("class", "number")
    .attr("x", function (d) { return d.xpos + 10; })
    .attr("y", function (d) { return d.ypos + 20; })
    .attr("dy", ".35em")
    .text(function (d) { return d.nval; })

var graph = d3.select("#graph")
    .append("svg")
    .attr("width", "561px")
    .attr("height", "200px")
    .append("g")

graph.append("rect")
    .style("fill", "#000")
    .attr("width", "550px")
    .attr("height", "200px")

var bars = graph
    .selectAll(".bar")
    .data(eventData)
    .enter().append("rect")
    .style("fill", "#0f0")
    .attr("class", "bar")
    .attr("x", function (d, i) { return i * 2 + 10 })
    .attr("y", function (d, i) { return 200 - d * 10 })
    .attr("width", 10)
    .attr("height", function (d, i) { return d * 10 })

const redraw = () => {
    row.selectAll(".square")
        .data(function (d) { return d; })
        .style("fill", function (d) {
            return getColor(d.nval);
        });
    row.selectAll(".number")
        .data(function (d) { return d; })
        .text(function (d) { return d.nval; })

    scaleFactor = 200 / eventDataMax
    graph
        .selectAll(".bar")
        .remove()
    graph
        .selectAll(".bar")
        .data(eventData)
        .enter().append("rect")
        .style("fill", "#0f0")
        .attr("class", "bar")
        .attr("x", function (d, i) { return i * 2 + 5 })
        .attr("y", function (d, i) { return 200 - d * scaleFactor })
        .attr("i", function (d, i) { return i })
        .attr("width", 2)
        .attr("height", function (d, i) { return d * scaleFactor })

    graph
        .append("rect")
        .style("fill", "#333")
        .attr("class", "bar")
        .attr("x", eventData.length * 2 + 7)
        .attr("y", 0)
        .attr("width", 2)
        .attr("height", 200)
}

const clearData = () => {
    gridData.forEach((row) => {
        row.forEach((cell) => {
            cell.nval = 0;
        })
    })
    eventData.length = 0
    redraw();
}

const simulateInsert = ({ x, y }) => {
    var events = 0;
    const dp = gridData[y][x];
    dp.nval++;
    if (dp.nval >= 4) {
        dp.nval = 0;
        events++;
        dp.neighbours.forEach((pos) => events += simulateInsert(pos));
    }
    return events;
}


const updateColor = ({ x, y }) => {
    const eventCount = simulateInsert({ x, y });
    eventData.push(eventCount);
    eventDataMax = Math.max(eventDataMax, eventCount)
    while (eventData.length > 260) {
        eventData.shift();
    }
    redraw();
}

var timedInterval;
var timeMillis = 100
var updateMethod = "random"

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

const startTimed = () => {
    if (!timedInterval) {
        timedInterval = setInterval(function () {
            if (updateMethod === "random") {
                updateColor({ x: getRandomInt(COLUMNS), y: getRandomInt(ROWS) });
            } else if (updateMethod === "fixed center") {
                updateColor({ x: 5, y: 5 });
            } else if (updateMethod === "fixed corner") {
                updateColor({ x: 0, y: 0 });
            }
        }, timeMillis);
    }
}

const stopTimed = () => {
    if (timedInterval) clearInterval(timedInterval);
    timedInterval = null;
}

const selectSpeed = document.getElementById("speed");
selectSpeed.value = "fast"
selectSpeed.onchange = () => {
    const speeds = { slow: 300, fast: 100, ultra: 17 }
    timeMillis = speeds[selectSpeed.value];
    if (timedInterval) {
        stopTimed();
        startTimed();
    }
}

const startButton = document.getElementById("start");
startButton.onclick = startTimed;
const stopButton = document.getElementById("stop");
stopButton.onclick = stopTimed;
const clearButton = document.getElementById("clear");
clearButton.onclick = clearData;
const selectMethod = document.getElementById("method");
selectMethod.onchange = () => {
    updateMethod = selectMethod.value;
    console.log(updateMethod);
}
