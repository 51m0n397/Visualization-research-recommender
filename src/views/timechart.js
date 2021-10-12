import * as d3 from 'd3'

export default function () {
    let data = []

    const margin = { top: 10, right: 20, bottom: 10, left: 30 }
    const gap = 30
    const height2 = 50
    const gap1 = 30
    const height3 = 10
    const pointRadious = 3

    const rectWidth = 10
    const legendMargin = 10
    const pad1 = 5
    const pad2 = 10

    let updateData
    const timechart = function (selection) {
        selection.each(function () {
            const div = this
            const dom = d3.select(div)
            const svg = dom.append("svg")

            let brushRange = null

            function draw() {
                const bBox = div.getBoundingClientRect()

                svg.selectAll("*").remove()

                svg.attr("width", bBox.width)
                    .attr("height", bBox.height)

                const width = bBox.width - margin.left - margin.right
                const height = bBox.height - margin.top - margin.bottom
                const height1 = height - gap - height2 - gap1 - height3

                const numTicksX = Math.floor(width / 40)
                const numTicksY = Math.floor(height1 / 20)

                const focus = svg.append("g")
                    .attr("transform",
                        "translate(" + margin.left + "," + margin.top + ")")

                const context = svg.append("g")
                    .attr("transform",
                        "translate(" + margin.left + "," + (margin.top + height1 + gap) + ")")

                const legend = svg.append("g")
                    .attr("transform",
                        "translate(" + legendMargin + "," + (margin.top + height1 + gap + height2 + gap1) + ")")

                let xPos = 0
                legend.append("rect")
                    .attr("x", xPos)
                    .attr("y", 0)
                    .attr("height", rectWidth)
                    .attr("width", rectWidth)
                    .attr("fill", "steelblue")

                xPos += rectWidth + pad1
                const papersText = legend
                    .append("text")
                    .attr("x", xPos)
                    .attr("y", 10)
                    .text("Papers")

                xPos += papersText.node().getBoundingClientRect().width + pad2
                legend.append("rect")
                    .attr("x", xPos)
                    .attr("y", 0)
                    .attr("height", rectWidth)
                    .attr("width", rectWidth)
                    .attr("fill", "red")

                xPos += rectWidth + pad1
                legend.append("text")
                    .attr("x", xPos)
                    .attr("y", 10)
                    .text("Citations")

                const xScale = d3.scaleTime()
                    .domain([])
                    .range([0, width])
                const yScale = d3.scaleLinear()
                    .domain([])
                    .range([height1, 0])

                const xScale2 = d3.scaleTime()
                    .domain([])
                    .range([0, width])
                const yScale2 = d3.scaleLinear()
                    .domain([])
                    .range([height2, 0])

                const xAxis = d3.axisBottom(xScale)
                    .ticks(numTicksX)
                    .tickSize(10)
                const xAxisTicks = d3.axisBottom(xScale)
                    .ticks(d3.timeYear)
                    .tickFormat("")
                const yAxis = d3.axisLeft(yScale)
                    .tickFormat(d3.format('d'))

                const xAxis2 = d3.axisBottom(xScale2)
                    .ticks(numTicksX)
                    .tickSize(10)
                const xAxis2Ticks = d3.axisBottom(xScale2)
                    .ticks(d3.timeYear)
                    .tickFormat("")

                const xGroup = focus.append("g")
                    .attr("transform", "translate(0," + height1 + ")")
                    .call(xAxis)
                const xGroupTicks = focus.append("g")
                    .attr("transform", "translate(0," + height1 + ")")
                    .call(xAxisTicks)
                const yGroup = focus.append("g")
                    .call(yAxis)

                const xGroup2 = context.append("g")
                    .attr("transform", "translate(0," + height2 + ")")
                    .call(xAxis2)
                const xGroup2Ticks = context.append("g")
                    .attr("transform", "translate(0," + height2 + ")")
                    .call(xAxis2Ticks)

                const lineA = d3.line()
                    .x((d) => xScale(d.year))
                    .y((d) => yScale(d.papers))
                    .curve(d3.curveLinear)

                const lineB = d3.line()
                    .x((d) => xScale(d.year))
                    .y((d) => yScale(d.citations))
                    .curve(d3.curveLinear)

                const lineA2 = d3.line()
                    .x((d) => xScale2(d.year))
                    .y((d) => yScale2(d.papers))
                    .curve(d3.curveLinear)

                const lineB2 = d3.line()
                    .x((d) => xScale2(d.year))
                    .y((d) => yScale2(d.citations))
                    .curve(d3.curveLinear)

                const clip = svg.append("defs").append("clipPath")
                    .attr("id", "clip-time")
                    .append("rect")
                    .attr("width", width + 2 * pointRadious)
                    .attr("height", height1 + 2 * pointRadious)
                    .attr("transform", "translate(" + (-pointRadious) + ',' + (-pointRadious) + ")")

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
                        .html(
                            "Year: " + d.year.getFullYear() +
                            "<br>papers: " + d.papers +
                            "<br>citations: " + d.citations
                        )
                        .style("right", (window.innerWidth - event.pageX + 10) + "px")
                        .style("top", (event.pageY) + "px")
                }

                function mouseleave(event, d) {
                    tooltip
                        .transition()
                        .duration(200)
                        .style("opacity", 0)
                        .on("end", () => tooltip.style("display", 'none'))
                }

                let startSelection = []

                const brush = d3.brushX()
                    .extent([[0, 0], [width, height2]])
                    .on("start", (event) => startSelection = event.selection)
                    .on("brush end", brushed)

                const brushArea = context.append("g")
                    .attr("class", "brush")
                    .style("display", data.length > 0 ? "Block" : "None")
                    .call(brush)

                function brushed(event) {
                    if (event.sourceEvent != undefined) {
                        const selection = event.selection != null ? event.selection : startSelection
                        let domain = selection.map(xScale2.invert, xScale2)
                        domain[0] = d3.timeParse("%Y")(domain[0].getFullYear())
                        domain[1] = d3.timeParse("%Y")(domain[1].getFullYear())
                        if (domain[0].getFullYear() == xScale2.domain()[1].getFullYear())
                            domain[0] = d3.timeParse("%Y")(domain[0].getFullYear() - 1)
                        if (domain[0].getFullYear() == domain[1].getFullYear())
                            domain[1] = d3.timeParse("%Y")(domain[1].getFullYear() + 1)

                        brushRange = domain
                        xScale.domain(domain)
                        brushArea.call(brush.move, brushRange.map(xScale2))


                        if (domain[1].getFullYear() - domain[0].getFullYear() < numTicksX) {
                            xAxis.ticks(d3.timeYear)
                        } else {
                            xAxis.ticks(numTicksX)
                        }

                        drawLines(0)
                    }
                }

                function drawLines(duration) {
                    xGroup.transition()
                        .duration(duration)
                        .call(xAxis)
                    xGroupTicks.transition()
                        .duration(duration)
                        .call(xAxisTicks)
                    yGroup.transition()
                        .duration(duration)
                        .call(yAxis.scale(yScale).tickValues(yScale.ticks(numTicksY).filter(Number.isInteger)))
                    xGroup2.transition()
                        .duration(duration)
                        .call(xAxis2)
                    xGroup2Ticks.transition()
                        .duration(duration)
                        .call(xAxis2Ticks)


                    const selectionA = focus.selectAll(".lineA")
                        .data([data])
                    selectionA.enter()
                        .append("path")
                        .attr("class", "lineA")
                        .merge(selectionA)
                        .transition()
                        .duration(duration)
                        .attr('d', lineA)
                        .attr("fill", "none")
                        .attr("stroke", "steelblue")
                        .attr("stroke-width", 1.5)
                        .attr("clip-path", "url(#clip-time)")

                    const selectionB = focus.selectAll(".lineB")
                        .data([data])
                    selectionB.enter()
                        .append("path")
                        .attr("class", "lineB")
                        .merge(selectionB)
                        .transition()
                        .duration(duration)
                        .attr('d', lineB)
                        .attr("fill", "none")
                        .attr("stroke", "red")
                        .attr("stroke-width", 1.5)
                        .attr("clip-path", "url(#clip-time)")

                    const selectionA2 = context.selectAll(".lineA")
                        .data([data])
                    selectionA2.enter()
                        .append("path")
                        .attr("class", "lineA")
                        .merge(selectionA2)
                        .transition()
                        .duration(duration)
                        .attr('d', lineA2)
                        .attr("fill", "none")
                        .attr("stroke", "steelblue")
                        .attr("stroke-width", 1.5)

                    const selectionB2 = context.selectAll(".lineB")
                        .data([data])
                    selectionB2.enter()
                        .append("path")
                        .attr("class", "lineB")
                        .merge(selectionB2)
                        .transition()
                        .duration(duration)
                        .attr('d', lineB2)
                        .attr("fill", "none")
                        .attr("stroke", "red")
                        .attr("stroke-width", 1.5)


                    const pointsA = focus.selectAll(".pointsA")
                        .data(data)
                        .join(
                            enter => enter
                                .append('circle')
                                .attr('class', "pointsA")
                                .attr("cx", (d) => xScale(d.year))
                                .attr("cy", (d) => yScale(d.papers))
                                .attr("r", pointRadious)
                                .attr("fill", "steelblue")
                                .attr("clip-path", "url(#clip-time)"),
                            update => update
                                .transition()
                                .duration(duration)
                                .attr('class', "pointsA")
                                .attr("cx", (d) => xScale(d.year))
                                .attr("cy", (d) => yScale(d.papers))
                                .attr("r", pointRadious)
                                .attr("fill", "steelblue")
                                .attr("clip-path", "url(#clip-time)")
                                .selection(),

                            exit => exit
                                .remove()
                        )

                    const pointsB = focus.selectAll(".pointsB")
                        .data(data)
                        .join(
                            enter => enter
                                .append('circle')
                                .attr('class', "pointsB")
                                .attr("cx", (d) => xScale(d.year))
                                .attr("cy", (d) => yScale(d.citations))
                                .attr("r", pointRadious)
                                .attr("fill", "red")
                                .attr("clip-path", "url(#clip-time)"),

                            update => update
                                .transition()
                                .duration(duration)
                                .attr('class', "pointsB")
                                .attr("cx", (d) => xScale(d.year))
                                .attr("cy", (d) => yScale(d.citations))
                                .attr("r", pointRadious)
                                .attr("fill", "red")
                                .attr("clip-path", "url(#clip-time)")
                                .selection(),

                            exit => exit
                                .remove()
                        )

                    pointsA
                        .on("mouseover", mouseover)
                        .on("mousemove", mousemove)
                        .on("mouseleave", mouseleave)

                    pointsB
                        .on("mouseover", mouseover)
                        .on("mousemove", mousemove)
                        .on("mouseleave", mouseleave)


                }

                xScale2.domain(d3.extent(data.map(d => d.year)))
                yScale2.domain([0, d3.max(data.map(d => Math.max(d.papers, d.citations)))])
                yScale.domain(yScale2.domain())

                if (brushRange == null) brushRange = xScale2.domain()
                xScale.domain(brushRange)
                brushArea.call(brush.move, brushRange.map(xScale2))

                drawLines(0)

                updateData = function () {
                    brushArea.style("display", data.length > 0 ? "Block" : "None")

                    xScale.domain(d3.extent(data.map(d => d.year)))
                    yScale.domain([0, d3.max(data.map(d => Math.max(d.papers, d.citations)))])
                    xScale2.domain(xScale.domain())
                    yScale2.domain(yScale.domain())

                    brushRange = xScale.domain()
                    brushArea.call(brush.move, brushRange.map(xScale2))

                    xAxis.ticks(numTicksX)
                    xAxis2.ticks(numTicksX)

                    drawLines(500)
                }

            }
            draw()

            window.addEventListener('resize', draw)

        })
    }

    timechart.data = function (_) {
        if (!arguments.length) return data
        data = _
        if (typeof updateData === 'function') updateData()
        return timechart
    }


    return timechart
}
