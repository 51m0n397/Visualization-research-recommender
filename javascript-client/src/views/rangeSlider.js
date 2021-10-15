import * as d3 from 'd3'

export default function () {
    let data = { name: "", range: [], selected: null }

    let onChange
    let updateData
    const rangeSlider = function (selection) {
        selection.each(function () {
            const div = this
            const dom = d3.select(div)

            dom.attr('class', "input-container")

            const title = dom.append("div")
                .html(data.name + ":")
                .attr('class', "input-title")

            const container = dom.append('div')
                .style('display', 'flex')
                .style('align-items', 'center')

            const minLabel = container.append('div')
                .text(data.range[0])
                .style('margin-right', '5px')

            const slider = container.append("input")
                .style('flex', 1)
                .attr('type', 'range')
                .attr('step', 'any')
                .attr('min', data.range[0])
                .attr('max', data.range[1])
                .attr('value', data.selected)
                .on('input', (e) => currentLabel.text(e.target.value))
                .on('change', (e) => onChange(e.target.value))

            const maxLabel = container.append('div')
                .text(data.range[1])
                .style('margin-left', '5px')

            const currentLabel = dom.append('div')
                .text(data.selected)
                .style('text-align', 'center')

            updateData = function () {
                title.html(data.name + ":")

                minLabel.text(data.range[0])

                slider
                .attr('min', data.range[0])
                .attr('max', data.range[1])
                .attr('value', data.selected)

                maxLabel.text(data.range[1])

                currentLabel.text(data.selected)
            }


        })
    }

    rangeSlider.data = function (_) {
        if (!arguments.length) return data
        data = _
        if (typeof updateData === 'function') updateData()
        return rangeSlider
    }

    rangeSlider.bindChange = (callback) => onChange = callback

    return rangeSlider
}