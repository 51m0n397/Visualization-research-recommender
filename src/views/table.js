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

            const titles = (data.data.length > 0 ? Object.keys(data.data[0]) : []).filter(t => t != 'color')
            const color = data.data.length > 0 && Object.keys(data.data[0]).includes('color')
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
                .data((d) => titles.map((k) => ({ 'value': d[k], 'name': k, 'color': d.color })))
                .enter()
                .append('td')
                .attr('data-th', (d) => d.name)
                .append("div")
                .attr('class', 'table-cell')
                .style("display", 'flex')
                .style("align-items", 'center')
                .html((d, i) => {
                    if (i == 0 && color)
                        return '<svg></svg>' + '<div style="flex:1">' + d.value + '</div>'
                    return d.value
                })
                .select('svg')
                .attr('height', "1em")
                .attr('width', "1em")
                .style("padding-right", '5px')
                .append('circle')
                .attr("cx", (d) => "0.5em")
                .attr("cy", (d) => "0.5em")
                .attr("r", (d) => "0.4em")
                .attr("fill", (d) => d.color)
                .style("stroke", "grey")
                .style("stroke-width", 1)

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
                console.log('up')
                const titles = (data.data.length > 0 ? Object.keys(data.data[0]) : []).filter(t => t != 'color')
                const color = data.data.length > 0 && Object.keys(data.data[0]).includes('color')
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
                    .data((d) => titles.map((k) => ({ 'value': d[k], 'name': k, 'color': d.color })))
                    .join(
                        enter => enter
                            .append('td')
                            .attr('data-th', (d) => d.name)
                            .append("div")
                            .attr('class', 'table-cell')
                            .style("display", 'flex')
                            .style("align-items", 'center')
                            .html((d, i) => {
                                if (i == 0 && color)
                                    return '<svg></svg>' + '<div style="flex:1">' + d.value + '</div>'
                                return d.value
                            })
                            .select('svg')
                            .attr('height', "1em")
                            .attr('width', "1em")
                            .style("padding-right", '5px')
                            .append('circle')
                            .attr("cx", (d) => "0.5em")
                            .attr("cy", (d) => "0.5em")
                            .attr("r", (d) => "0.4em")
                            .attr("fill", (d) => d.color)
                            .style("stroke", "grey")
                            .style("stroke-width", 1),
                        update => update
                            .attr('data-th', (d) => d.name)
                            .html('')
                            .append("div")
                            .attr('class', 'table-cell')
                            .style("display", 'flex')
                            .style("align-items", 'center')
                            .html((d, i) => {
                                if (i == 0 && color)
                                    return '<svg></svg>' + '<div style="flex:1">' + d.value + '</div>'
                                return d.value
                            })
                            .select('svg')
                            .attr('height', "1em")
                            .attr('width', "1em")
                            .style("padding-right", '5px')
                            .append('circle')
                            .attr("cx", (d) => "0.5em")
                            .attr("cy", (d) => "0.5em")
                            .attr("r", (d) => "0.4em")
                            .attr("fill", (d) => d.color)
                            .style("stroke", "grey")
                            .style("stroke-width", 1),
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