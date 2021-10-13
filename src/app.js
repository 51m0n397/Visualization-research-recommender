import * as d3 from 'd3'

import controller from './controller'

const app = function () {
    window.app = controller
    loadData().then(() => {
        const grid = d3.select('#root')
            .append('div')
            .attr('id', 'grid')

        const topicsTableContainer = d3.select('#grid')
            .append('div')
            .attr('id', 'topics_table')
            .attr('class', 'cell')
        topicsTableContainer
            .append('div')
            .attr('class', 'title')
            .html('Topics')
        topicsTableContainer
            .append('div')
            .attr('class', 'table_container')
            .call(window.app.topicsTable)

        const keywordsPlotContainer = d3.select('#grid')
            .append('div')
            .attr('id', 'keywords_plot')
            .attr('class', 'cell')
        keywordsPlotContainer
            .append('div')
            .attr('class', 'title')
            .html('Keywords')
        keywordsPlotContainer
            .append('div')
            .call(window.app.keywordsPlot)

        const trendsChartContainer = d3.select('#grid')
            .append('div')
            .attr('id', 'trends_chart')
            .attr('class', 'cell')
        trendsChartContainer
            .append('div')
            .attr('class', 'title')
            .html('Trends')
        trendsChartContainer
            .append('div')
            .call(window.app.trendsChart)

        const filtersContainer = d3.select('#grid')
            .append('div')
            .attr('id', 'filters')
            .attr('class', 'cell')
        filtersContainer
            .append('div')
            .attr('class', 'title')
            .html('Filters')
        filtersContainer.append('div')
            .attr('id', 'conferences-filter')
            .style('margin', '10px')
            .call(window.app.conferencesFilter)
        filtersContainer.append('div')
            .attr('id', 'type-filter')
            .style('margin', '10px')
            .call(window.app.typeFilter)
        filtersContainer.append('div')
            .attr('id', 'hIndex-filter')
            .style('margin', '10px')
            .call(window.app.hIndexFilter)

        const papersTableContainer = d3.select('#grid')
            .append('div')
            .attr('id', 'papers_table')
            .attr('class', 'cell')
        papersTableContainer
            .append('div')
            .attr('class', 'title')
            .html('Papers')
        papersTableContainer
            .append('div')
            .attr('class', 'table_container')
            .call(window.app.papersTable)
    })
}

const loadData = function () {
    return new Promise((resolve, reject) => {
        Promise.all([
            d3.csv("keywords.csv"),
            d3.csv("papers.csv")
        ]).then(([keywords, papers]) => {
            controller.handleLoadData(keywords, papers)
            resolve(true)
        })
            .catch(error => reject(error))
    })
}

export default app
