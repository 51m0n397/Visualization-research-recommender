import * as d3 from 'd3'
import * as utils from './utils'
import model from './model'
import views from './views'
import axios from 'axios'

class Controller {
    constructor() {
        this.model = model

        this.overlay = views.loadingOverlay()

        this.keywordsTable = views.table()
        this.occurrenciesFilter = views.doubleRangeSlider()
        this.distanceSlider = views.rangeSlider()
        this.keywordsCount = views.textbox()
        this.topicsCount = views.textbox()
        this.errorMessage = views.textbox()
        this.topicsTable = views.table()
        this.keywordsPlot = views.scatterplot()
        this.trendsChart = views.timechart()
        this.papersTable = views.table()
        this.conferencesFilter = views.checkbox()
        this.typeFilter = views.checkbox()

        this.model.bindKeywordsChanged(this.onKeywordsChanged.bind(this))
        this.model.bindThresholdChanged(this.onThresholdChanged.bind(this))
        this.model.bindClusteringParamsChanged(this.onClusteringParamsChanged.bind(this))
        this.model.bindTopicsChanged(this.onTopicsChanged.bind(this))

        this.keywordsTable.bindClick((keyword) => {
            this.model.toggleKeyword(keyword.Keyword)
        }).bind(this)


        this.occurrenciesFilter.bindSelect((occurreciesRange) => {
            this.model.selectOccurrencies(occurreciesRange)
        }).bind(this)

        this.distanceSlider.bindChange((threshold) => {
            this.model.setDistanceThreshold(threshold)
        }).bind(this)

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
    }

    handleLoadData(papers) {
        this.model.setInitialData(papers)
    }

    onKeywordsChanged() {
        this.keywordsTable.data({
            data: this.model.keywords.slice().filter(k =>
                k.Occurrencies >= this.model.selectedOccurrencies[0] &&
                k.Occurrencies <= this.model.selectedOccurrencies[1]
            ),
            initialSorting: ['Occurrencies', 1]
        })

        this.occurrenciesFilter.data({
            name: 'Occurrencies range',
            range: this.model.occurreciesRange,
            selected: this.model.selectedOccurrencies
        })

        this.keywordsCount.text(
            this.model.keywords.filter(k =>
                k.Occurrencies >= this.model.selectedOccurrencies[0] &&
                k.Occurrencies <= this.model.selectedOccurrencies[1] &&
                k.selected
            ).length + ' keywords')
    }

    onThresholdChanged() {
        this.distanceSlider.data({
            name: 'Distance threshold',
            range: this.model.distanceRange,
            selected: this.model.distaceThreshold
        })
    }

    onClusteringParamsChanged() {
        this.overlay.show(true)

        axios
            .post('http://localhost:5000/', {
                keywords: this.model.keywords.filter(k =>
                    k.Occurrencies >= this.model.selectedOccurrencies[0] &&
                    k.Occurrencies <= this.model.selectedOccurrencies[1] &&
                    k.selected
                ).map(k => k.Keyword),
                threshold: this.model.distaceThreshold
            })
            .then(res => {
                this.model.setTopics(res.data)
            })
            .catch(error => {
                console.error(error)
            })
            .finally(() => {
                this.overlay.show(false)
            })
    }

    onTopicsChanged() {
        this.topicsCount.text(this.model.topics.length + ' topics')
        if (this.model.topics.length > 12)
            this.errorMessage.text("The topics are not color coded because they are more than 12")
        else
            this.errorMessage.text("")

        this.conferencesFilter.data({ name: 'Conferences', data: this.model.conferences })
        this.typeFilter.data({ name: 'Type', data: this.model.types })

        const filteredPapers = this.model.papers.filter(p =>
            this.model.conferences[p.Conference] &&
            this.model.types[p.PaperType]
        )

        this.keywordsPlot.data({
            data: this.model.keywordsPoints.map(k => ({
                x: k.x, y: k.y,
                label: k.keyword,
                class: k.topic,
                size: filteredPapers.filter(p => p.Keywords.includes(k.keyword)).length,
                color: k.color
            })),
            selected: this.model.selectedKeywords,
            sizeRange: d3.extent(this.model.keywords.map(k => k.Occurrencies))
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
                Topic: t.Topic,
                Keywords: t.Keywords.join(', '),
                Papers: filteredPapers.filter(p => utils.arrayIntersection(p.Keywords, t.Keywords).length > 0).length,
                Citations: citations.filter(c => utils.arrayIntersection(c.Keywords, t.Keywords).length > 0).length,
                color: this.model.topics.length <= 12 ? this.model.colorScale(t.Topic) : this.model.colorScale.range()[0]
            })),
            selected: { key: "Topic", value: this.model.selectedTopic }
        })

        const papersPerYear = d3.group(selectedPapers, p => p.Year)
        const citationsPerYear = d3.group(papersCitations, p => p.Year)

        const timeParser = d3.timeParse("%Y")
        let trendsData = []

        if (selectedPapers.length > 0) {
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