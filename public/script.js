const COLUMNS = 10;
const ROWS = 10;

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

console.log({ d3 });

const getColor = (d) => {
    if ((d) % 4 == 0) { return "#fff"; }
    if ((d) % 4 == 1) { return "#2C93E8"; }
    if ((d) % 4 == 2) { return "#F56C4E"; }
    if ((d) % 4 == 3) { return "#838690"; }
}

const gridData = createGridData();

var grid = d3.select("#grid")
    .append("svg")
    .attr("width", "510px")
    .attr("height", "510px");

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
    .style("fill", "transparent")
    .style("stroke", "#222")
    .on('click', function (d) {
        const target = d.target
        const x = d.srcElement.getAttribute('x-ix')
        const y = d.srcElement.getAttribute('y-ix')
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

const setColors = () => {
    row.selectAll(".square")
        .data(function (d) { return d; })
        .style("fill", function (d) {
            return getColor(d.nval);
        });
    row.selectAll(".number")
        .data(function (d) { return d; })
        .text(function (d) { return d.nval; })
}

const simulateInsert = ({ x, y }) => {
    const dp = gridData[y][x];
    dp.nval++;
    if (dp.nval >= 4) {
        dp.nval = 0;
        dp.neighbours.forEach(simulateInsert);
    }
}


const updateColor = ({ x, y }) => {
    console.log(gridData[y][x].nval);
    simulateInsert({ x, y });
    setColors();
}
