import * as d3 from 'd3'
import * as utils from '../utils'

export default function () {
    let data = { data: [], selected: null }

    const margin = { top: 0, right: 0, bottom: 0, left: 0 }

    let updateData
    const scatterplot = function (selection) {
        selection.each(function () {
            const div = this
            const dom = d3.select(div)
            const svg = dom.append("svg")

            let zoomTransform = d3.zoomIdentity


            function draw() {
                const bBox = div.getBoundingClientRect()

                svg.selectAll("*").remove()

                svg.attr("width", bBox.width)
                    .attr("height", bBox.height)

                const width = bBox.width - margin.left - margin.right
                const height = bBox.height - margin.top - margin.bottom

                const svgGroup = svg.append("g")
                    .attr("transform",
                        "translate(" + margin.left + "," + margin.top + ")")

                const clip = svg.append("defs").append("clipPath")
                    .attr("id", "clip")
                    .append("rect")
                    .attr("width", width)
                    .attr("height", height)

                const xScale = d3.scaleLinear()
                    .domain(utils.padLinear(d3.extent(data.data.map(d => d.x)), 0.1))
                    .range([0, width])
                const yScale = d3.scaleLinear()
                    .domain(utils.padLinear(d3.extent(data.data.map(d => d.y)), 0.1))
                    .range([height, 0])

                const sizeScale = d3.scaleLinear()
                    .domain(d3.extent(data.data.map(d => d.size)))
                    .range([4, 15])

                const colorScale = d3.scaleOrdinal(d3.schemePaired)
                    .domain(data.data.map(d => d.class))

                const tooltip = dom.append("div")
                    .style("opacity", 0)
                    .style("display", 'none')
                    .attr("class", "tooltip")

                function mouseover(event, d) {
                    tooltip
                        .style("opacity", 1)
                        .style("display", 'block')
                }

                function mousemove(event, d) {
                    tooltip
                        .html("keyword: " + d.label + "<br>topic: " + d.class)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY) + "px")
                }

                function mouseleave(event, d) {
                    tooltip
                        .transition()
                        .duration(200)
                        .style("opacity", 0)
                        .on("end", () => tooltip.style("display", 'none'))
                }

                const pointsGroup = svgGroup.append('g')
                    .attr("clip-path", "url(#clip)")

                pointsGroup.selectAll("circle")
                    .data(data.data)
                    .enter()
                    .append("circle")
                    .attr("cx", (d) => xScale(d.x))
                    .attr("cy", (d) => yScale(d.y))
                    .attr("transform", zoomTransform)
                    .attr("r", (d) => d.size > 0 ? sizeScale(d.size) / zoomTransform.k : 0)
                    .style("fill", (d) => colorScale(d.class))
                    .style("stroke", (d) => d.class == data.selected ? "black" : "grey")
                    .style("stroke-width", (d) => (d.class == data.selected ? 2 : 1) / zoomTransform.k)
                    .on("mouseover", mouseover)
                    .on("mousemove", mousemove)
                    .on("mouseleave", mouseleave)

                const zoom = d3.zoom()
                    .scaleExtent([1, Infinity])
                    .translateExtent([[0, 0], [width, height]])
                    .extent([[0, 0], [width, height]])
                    .on("zoom", ({ transform }) => {
                        zoomTransform = transform
                        pointsGroup.selectAll("circle")
                            .attr("transform", zoomTransform)
                            .attr("r", (d) => d.size > 0 ? sizeScale(d.size) / zoomTransform.k : 0)
                            .style("stroke-width", (d) => (d.class == data.selected ? 2 : 1) / zoomTransform.k)
                    })

                svg.call(zoom).call(zoom.transform, zoomTransform)


                updateData = function () {
                    pointsGroup.selectAll("circle")
                        .data(data.data)
                        .style("stroke-width", (d) => (d.class == data.selected ? 2 : 1) / zoomTransform.k)
                        .transition()
                        .duration(500)
                        .attr("cx", (d) => xScale(d.x))
                        .attr("cy", (d) => yScale(d.y))
                        .attr("transform", zoomTransform)
                        .attr("r", (d) => d.size > 0 ? sizeScale(d.size) / zoomTransform.k : 0)
                        .style("fill", (d) => colorScale(d.class))
                        .style("stroke", (d) => d.class == data.selected ? "black" : "grey")
                }

            }
            draw()

            window.addEventListener('resize', draw)
        })
    }

    scatterplot.data = function (_) {
        if (!arguments.length) return data
        data = _
        if (typeof updateData === 'function') updateData()
        return scatterplot
    }

    return scatterplot
}
