import * as d3 from 'd3'

export default function () {
    let data = { name: "", range: [], selected: [] }

    const height = 20
    const margin = 5
    const barHeight = 5

    let onSelect
    let updateData
    const range = function (selection) {
        selection.each(function () {
            const div = this
            const dom = d3.select(div)

            dom.attr('class', "input-container")

            dom.append("div")
                .html(data.name + ":")
                .attr('class', "input-title")

            const svg = dom.append("svg")

            function draw() {
                const bBox = div.getBoundingClientRect()

                svg.selectAll("*").remove()

                svg.attr("width", bBox.width)
                    .attr("height", height + 12)

                const width = bBox.width - 2 * margin

                const svgGroup = svg.append("g")
                    .attr("transform",
                        "translate(" + margin + ",0)")


                const scale = d3.scaleLinear()
                    .domain(data.range)
                    .range([0, width])

                svgGroup.append("rect")
                    .attr("rx", 3)
                    .attr("ry", 3)
                    .attr("x", scale.range()[0])
                    .attr("y", (height - barHeight) / 2)
                    .attr("width", scale.range()[1])
                    .attr("height", barHeight)
                    .attr('fill', 'whitesmoke')
                    .attr('stroke', 'darkgrey')

                let lastSelection = []

                const minLabel = svgGroup.append('text')
                    .text(scale.domain()[0])
                    .attr('text-anchor', "middle")
                    .attr('dx', 2)
                    .attr('y', height + 10)

                const maxLabel = svgGroup.append('text')
                    .text(scale.domain()[1])
                    .attr('text-anchor', "middle")
                    .attr('dx', 2)
                    .attr('y', height + 10)

                const brush = d3.brushX()
                    .extent([[0, margin], [width, height-margin]])
                    .on("start", (event) => {
                        lastSelection = event.selection
                        brushArea.select('.selection')
                            .attr("y", (height - barHeight) / 2)
                            .attr("height", barHeight)
                    })
                    .on("brush end", (event) => {
                        if (event.sourceEvent != undefined) {
                            const selection = event.selection != null ? event.selection : lastSelection
                            lastSelection = event.selection
                            let domain = selection.map(scale.invert, scale)
                            domain[0] = Math.round(domain[0])
                            domain[1] = Math.round(domain[1])
                            if (domain[1] < scale.domain()[0]) domain[1] = scale.domain()[0]
                            if (domain[0] > scale.domain()[1]) domain[0] = scale.domain()[1]

                            brushArea.call(brush.move, domain.map(scale))

                            minLabel.text(domain[0])
                                .attr('x', brushArea.select('.handle--w').attr('x'))

                            maxLabel.text(domain[1])
                                .attr('x', brushArea.select('.handle--e').attr('x'))

                            brushArea.select('.selection')
                                .attr("y", (height - barHeight) / 2)
                                .attr("height", barHeight)

                            if (event.type == 'end')
                                onSelect(domain)
                        }
                    })

                const brushArea = svgGroup.append("g")
                    .attr("class", "brush")
                    .call(brush)



                brushArea.call(brush.move, data.selected.map(scale))

                brushArea.select('.selection')
                    .attr("rx", 3)
                    .attr("ry", 3)
                    .attr('fill', 'DodgerBlue')
                    .attr('fill-opacity', 1)
                    .attr("y", (height - barHeight) / 2)
                    .attr("height", barHeight)
                    .attr('stroke', 'darkgrey')

                brushArea.selectAll('.handle')
                    .attr("rx", 3)
                    .attr("ry", 3)
                    .attr('fill', 'whitesmoke')
                    .attr('stroke', 'darkgrey')

                minLabel.attr('x', brushArea.select('.handle--w').attr('x'))
                maxLabel.attr('x', brushArea.select('.handle--e').attr('x'))
            }

            draw()
            window.addEventListener('resize', draw)
        })
    }

    range.data = function (_) {
        if (!arguments.length) return data
        data = _
        if (typeof updateData === 'function') updateData()
        return range
    }

    range.bindSelect = (callback) => onSelect = callback

    return range
}