import * as d3 from 'd3'

export default function () {
    let data = { data: [], selected: null }

    let updateData
    let onClick

    const table = function (selection) {
        selection.each(function () {
            const dom = d3.select(this)

            const titles = data.data.length > 0 ? Object.keys(data.data[0]) : []

            const table = dom.append('table')
                .attr('width', '100%')
            const header = table.append('thead').append('tr')
            const body = table.append('tbody')

            const headers = header
                .selectAll('th')
                .data(titles).enter()
                .append('th')
                .text((d) => d)

            const rows = body.selectAll('tr')
                .data(data.data).enter()
                .append('tr')
                .attr('class', (d) => {
                    if (data.selected && d[data.selected.key] == data.selected.value)
                        return "selected"
                    return ''
                })
            rows.selectAll('td')
                .data((d) => titles.map((k) => ({ 'value': d[k], 'name': k })))
                .enter()
                .append('td')
                .attr('data-th', (d) => d.name)
                .text((d) => d.value)

            rows.on('click', (_e, d) => onClick(d))

            updateData = function () {
                const titles = data.data.length > 0 ? Object.keys(data.data[0]) : []

                const headers = header
                    .selectAll('th')
                    .data(titles)
                    .join(
                        enter => enter
                            .append('th')
                            .text((d) => d),
                        update => update
                            .text((d) => d),
                        exit => exit.remove()
                    )

                const rows = body
                    .selectAll('tr')
                    .data(data.data)
                    .join(
                        enter => enter
                            .append('tr')
                            .attr('class', (d) => {
                                if (data.selected && d[data.selected.key] == data.selected.value)
                                    return "selected"
                                return ''
                            }),
                        update => update
                            .attr('class', (d) => {
                                if (data.selected && d[data.selected.key] == data.selected.value)
                                    return "selected"
                                return ''
                            }),
                        exit => exit.remove()
                    )


                rows.selectAll('td')
                    .data((d) => titles.map((k) => ({ 'value': d[k], 'name': k })))
                    .join(
                        enter => enter
                            .append('td')
                            .attr('data-th', (d) => d.name)
                            .text((d) => d.value),
                        update => update
                            .attr('data-th', (d) => d.name)
                            .text((d) => d.value),
                        exit => exit.remove()
                    )
            }
        })
    }

    table.data = function (_) {
        if (!arguments.length) return data
        data = _
        if (typeof updateData === 'function') updateData()
        return table
    }

    table.bindClick = (callback) => onClick = callback

    return table

}