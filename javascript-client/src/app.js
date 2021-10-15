import * as d3 from 'd3'

import controller from './controller'

const app = function () {
    window.app = controller
    loadData().then(() => {
        const overlay = d3.select('#root')
            .append('div')
            .attr('id', 'overlay')
            .call(window.app.overlay)

        const grid = d3.select('#root')
            .append('div')
            .attr('id', 'grid')

        const keywordsTableContainer = d3.select('#grid')
            .append('div')
            .attr('id', 'keywords_table')
            .attr('class', 'cell')
        keywordsTableContainer
            .append('div')
            .attr('class', 'title')
            .html('Keywords')
        keywordsTableContainer
            .append('div')
            .attr('class', 'table_container')
            .call(window.app.keywordsTable)

        const clusteringParametersContainer = d3.select('#grid')
            .append('div')
            .attr('id', 'clustering_params')
            .attr('class', 'cell')
        clusteringParametersContainer
            .append('div')
            .attr('class', 'title')
            .html('Clustering Parameters')
        clusteringParametersContainer
            .append('div')
            .attr('id', 'occurrencies_filter')
            .style('margin', '10px')
            .call(window.app.occurrenciesFilter)
        clusteringParametersContainer
            .append('div')
            .attr('id', 'distance_treshold')
            .style('margin', '10px')
            .call(window.app.distanceSlider)
        clusteringParametersContainer
            .append('div')
            .style('margin', '10px')
            .call(window.app.keywordsCount)
        clusteringParametersContainer
            .append('div')
            .style('margin', '10px')
            .call(window.app.topicsCount)
        clusteringParametersContainer
            .append('div')
            .style('margin', '10px')
            .style('color', 'red')
            .call(window.app.errorMessage)

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
    })
}

const loadData = function () {
    return new Promise((resolve, reject) => {
        d3.csv("papers.csv").then((papers) => {
            controller.handleLoadData(papers)
            resolve(true)
        })
            .catch(error => reject(error))
    })
}

export default app
