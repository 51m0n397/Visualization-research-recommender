import * as d3 from 'd3'

export default function () {
    let data = { data: [], selected: null }
    let sorting = null

    const sortingOrders = [
        { class: 'aes', function: d3.ascending },
        { class: 'des', function: d3.descending }
    ]

    let updateData
    let onClick

    const table = function (selection) {
        selection.each(function () {
            const dom = d3.select(this)

            const titles = data.data.length > 0 ? Object.keys(data.data[0]) : []
            if (titles.length > 0 && sorting == null)
                sorting = [titles[0], 0]

            const table = dom.append('table')
                .attr('width', '100%')
            const header = table.append('thead').append('tr')
            const body = table.append('tbody')

            const headers = header
                .selectAll('th')
                .data(titles)
                .enter()
                .append('th')
                .attr('class', (d) => { if (sorting[0] == d) return sortingOrders[sorting[1]].class })
                .text((d) => d)

            const rows = body.selectAll('tr')
                .data(data.data.sort((a, b) => sortingOrders[sorting[1]].function(a[sorting[0]], b[sorting[0]])))
                .enter()
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

            headers.on('click', function (event, d) {
                headers.attr('class', 'header')

                if (d == sorting[0])
                    sorting[1] = sorting[1] == 1 ? 0 : 1
                else
                    sorting[0] = d

                this.className = sortingOrders[sorting[1]].class
                rows.sort((a, b) => sortingOrders[sorting[1]].function(a[sorting[0]], b[sorting[0]]))
            })

            updateData = function () {
                const titles = data.data.length > 0 ? Object.keys(data.data[0]) : []
                if (titles.length > 0 && sorting == null)
                sorting = [titles[0], 0]

                const headers = header
                    .selectAll('th')
                    .data(titles)
                    .join(
                        enter => enter
                            .append('th')
                            .attr('class', (d) => { if (sorting[0] == d) return sortingOrders[sorting[1]].class })
                            .text((d) => d),
                        update => update
                            .attr('class', (d) => { if (sorting[0] == d) return sortingOrders[sorting[1]].class })
                            .text((d) => d),
                        exit => exit.remove()
                    )

                const rows = body
                    .selectAll('tr')
                    .data(data.data.sort((a, b) => sortingOrders[sorting[1]].function(a[sorting[0]], b[sorting[0]])))
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

                headers.on('click', function (event, d) {
                    headers.attr('class', 'header')

                    if (d == sorting[0])
                        sorting[1] = sorting[1] == 1 ? 0 : 1
                    else
                        sorting[0] = d

                    this.className = sortingOrders[sorting[1]].class
                    rows.sort((a, b) => sortingOrders[sorting[1]].function(a[sorting[0]], b[sorting[0]]))
                })
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