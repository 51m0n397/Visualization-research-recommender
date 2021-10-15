import * as d3 from 'd3'

export default function () {
    let text = ""

    let updateText
    const textbox = function (selection) {
        selection.each(function () {
            const dom = d3.select(this)

            dom.text(text)

                updateText = function () {
                    dom.text(text)

            }

        })
    }

    textbox.text = function (_) {
        if (!arguments.length) return text
        text = _
        if (typeof updateText === 'function') updateText()
        return textbox
    }

    return textbox
}