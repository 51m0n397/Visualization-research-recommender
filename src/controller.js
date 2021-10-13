import * as d3 from 'd3'
import * as utils from './utils'
import model from './model'
import views from './views'

class Controller {
    constructor() {
        this.model = model

        this.topicsTable = views.table()
        this.keywordsPlot = views.scatterplot()
        this.trendsChart = views.timechart()
        this.papersTable = views.table()
        this.conferencesFilter = views.checkbox()
        this.typeFilter = views.checkbox()
        this.hIndexFilter = views.range()

        this.model.bindDataChanged(this.onDataChanged.bind(this))

        this.topicsTable.bindClick((topic) => {
            this.model.selectTopic(topic.Topic)
        }).bind(this)

        this.keywordsPlot.bindSelect((keywords) => {
            this.model.selectKeywords(keywords)
        }).bind(this)

        this.conferencesFilter.bindClick((conference, checked) => {
            this.model.selectConferences(conference, checked)
        }).bind(this)

        this.typeFilter.bindClick((type, checked) => {
            this.model.selectType(type, checked)
        }).bind(this)

        this.hIndexFilter.bindSelect((hIndexRange) => {
            this.model.selectHindex(hIndexRange)
        }).bind(this)
    }

    handleLoadData(keywords, papers) {
        this.model.setInitialData(keywords, papers)
    }

    onDataChanged() {
        this.conferencesFilter.data({ name: 'Conferences', data: this.model.conferences })
        this.typeFilter.data({ name: 'Type', data: this.model.types })
        this.hIndexFilter.data({ name: 'H-index', range: this.model.hIndexRange, selected: this.model.selectedHindex})

        const filteredPapers = this.model.papers.filter(p => 
            this.model.conferences[p.Conference] && 
            this.model.types[p.PaperType] && 
            p.bestHIndex >= this.model.selectedHindex[0] && 
            p.bestHIndex <= this.model.selectedHindex[1]
        )

        this.keywordsPlot.data({
            data: this.model.keywords.map(k => ({
                x: +k.x, y: +k.y,
                label: k.keyword,
                class: k.topic,
                size: filteredPapers.filter(p => p.Keywords.includes(k.keyword)).length,
                color: k.color
            })),
            selected: this.model.selectedKeywords
        })

        const selectedPapers = filteredPapers.filter(p => utils.arrayIntersection(p.Keywords, this.model.selectedKeywords).length > 0)

        this.papersTable.data({
            data: selectedPapers
                .map(p => ({
                    Title: p.Title,
                    Authors: p.Authors.join(', '),
                    Conference: p.Conference,
                    "Paper type": p.PaperType,
                    Year: p.Year,
                    Keywords: p.Keywords.join(', '),
                    Topics: p.Topics.join(', '),
                }))
        })

        // for each paper tells the cited papers
        // only cited papers are filtered (is this right?)
        const papersCitations = this.model.papers.map(p => ({
            DOI: p.DOI,
            Year: p.Year,
            citations: p.InternalReferences.map(DOI => this.model.papers[this.model.papersById[DOI]]).filter(p => filteredPapers.includes(p)),
        }))

        const citations = [].concat.apply([], papersCitations.map(p => p.citations))
        this.topicsTable.data({
            data: this.model.topics.map(t => ({
                Topic: t.topic,
                Papers: filteredPapers.filter(p => p.Topics.includes(t.topic)).length,
                Citations: citations.filter(c => c.Topics.includes(t.topic)).length,
                color: t.color
            })),
            selected: { key: "Topic", value: this.model.selectedTopic }
        })

        const papersPerYear = d3.group(selectedPapers, p => p.Year)
        const citationsPerYear = d3.group(papersCitations, p => p.Year)

        const timeParser = d3.timeParse("%Y")
        let trendsData = []

        if (selectedPapers.length>0) {
            for (let i = this.model.years[0]; i <= this.model.years[1]; i++) {
                let papers = papersPerYear.get(String(i))
                papers = papers != null ? papers.length : 0
                let citations = citationsPerYear.get(String(i))
                citations = papers != null ? [].concat.apply([], citationsPerYear.get(String(i)).map(p => p.citations)) : []
                citations = citations.filter(p => utils.arrayIntersection(p.Keywords, this.model.selectedKeywords).length > 0).length
                trendsData.push({ year: timeParser(i), papers: papers, citations: citations })
            }
        }

        this.trendsChart.data(trendsData)
    }
}

export default new Controller()