import * as d3 from 'd3'

export default function () {
    let data = { name: "", data: {} }

    let onClick
    let updateData
    const checkbox = function (selection) {
        selection.each(function () {
            const div = this
            const dom = d3.select(div)

            dom.attr('class', "input-container")

            const title = dom.append("div")
                .html(data.name + ":")
                .attr('class', "input-title")

            const checkboxes = dom.append('div')

            checkboxes.selectAll("input")
                .data(Object.entries(data.data))
                .enter()
                .append("div")
                .text((d) => d[0] + " ")
                .attr("class", "check-elem")
                .append("input")
                .attr('type', "checkbox")
                .property('checked', (d) => d[1])
                .attr('value', (d) => d[0])
                .on("click", (e, d) => onClick(d[0], e.target.checked))

            updateData = function () {
                title.html(data.name + ":")

                checkboxes.selectAll("*").remove()

                checkboxes.selectAll("input")
                .data(Object.entries(data.data))
                .enter()
                .append("div")
                .text((d) => d[0] + " ")
                .attr("class", "check-elem")
                .append("input")
                .attr('type', "checkbox")
                .property('checked', (d) => d[1])
                .attr('value', (d) => d[0])
                .on("click", (e, d) => onClick(d[0], e.target.checked))

            }

        })
    }

    checkbox.data = function (_) {
        if (!arguments.length) return data
        data = _
        if (typeof updateData === 'function') updateData()
        return checkbox
    }

    checkbox.bindClick = (callback) => onClick = callback

    return checkbox
}