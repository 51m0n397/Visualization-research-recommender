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

        const keywordsPlotContainer = d3.select('#grid')
            .append('div')
            .attr('id', 'keywords_plot')
            .attr('class', 'cell')

        const trendsChartContainer = d3.select('#grid')
            .append('div')
            .attr('id', 'trends_chart')
            .attr('class', 'cell')

        const filtersContainer = d3.select('#grid')
            .append('div')
            .attr('id', 'filters')
            .attr('class', 'cell')

        const papersTableContainer = d3.select('#grid')
            .append('div')
            .attr('id', 'papers_table')
            .attr('class', 'cell')
    })
}

const loadData = function () {
    return new Promise((resolve, reject) => {
        Promise.all([]).then(() => {
            resolve(true)
        })
            .catch(error => reject(error))
    })
}

export default app
