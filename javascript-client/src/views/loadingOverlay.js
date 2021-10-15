import * as d3 from 'd3'

export default function () {
    let show = false

    let updateState

    const loadingOverlay = function (selection) {
        selection.each(function () {
            const dom = d3.select(this)

            dom.style('position', 'absolute')
                .style('background-color', 'rgba(0, 0, 0, 0.5)')
                .style("width", "100%")
                .style("height", "100%")
                .style("z-index", 100)
                .style('display', show ? 'flex' : 'none')
                .style('align-items', 'center')

            dom.append('div')
            .style("flex", '1')
            .style("text-align", 'center')
            .style("font-size", '30px')
            .style('text-shadow', "2px 0 0 #fff, -2px 0 0 #fff, 0 2px 0 #fff, 0 -2px 0 #fff, 1px 1px #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff")
            .text("Loading...")


            updateState = function () {
                dom.style('display', show ? 'flex' : 'none')
            }

        })
    }

    loadingOverlay.show = function (_) {
        if (!arguments.length) return show
        show = _
        if (typeof updateState === 'function') updateState()
        return loadingOverlay
    }

    return loadingOverlay
}