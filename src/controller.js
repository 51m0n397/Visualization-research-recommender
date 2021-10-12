import * as d3 from 'd3'
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

        this.model.bindDataChanged(this.onDataChanged.bind(this))

        this.topicsTable.bindClick((topic) => {
            this.model.selectTopic(topic.Topic)
        }).bind(this)

        this.conferencesFilter.bindClick((conference, checked) => {
            this.model.selectConferences(conference, checked)
        }).bind(this)

        this.typeFilter.bindClick((type, checked) => {
            this.model.selectType(type, checked)
        }).bind(this)
    }

    handleLoadData(keywords, papers) {
        this.model.setInitialData(keywords, papers)
    }

    onDataChanged() {
        this.conferencesFilter.data({ name: 'Conferences', data: this.model.conferences })
        this.typeFilter.data({ name: 'Type', data: this.model.types })

        const filteredPapers = this.model.papers.filter(p => this.model.conferences[p.Conference] && this.model.types[p.PaperType])

        this.keywordsPlot.data({
            data: this.model.keywords.map(k => ({
                x: +k.x, y: +k.y,
                label: k.keyword,
                class: k.topic,
                size: filteredPapers.filter(p => p.Keywords.includes(k.keyword)).length
            })),
            selected: this.model.selectedTopic
        })

        const selectedTopicPapers = filteredPapers.filter(p => p.Topics.includes(this.model.selectedTopic))

        this.papersTable.data({
            data: selectedTopicPapers
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

        // for each paper tells the topics of the cited papers
        const topicsCitedByPapers = filteredPapers.map(p => ({
            DOI: p.DOI,
            Year: p.Year,
            citedTopics: [].concat.apply([], p.InternalReferences.map(DOI => this.model.papers[this.model.papersById[DOI]]).filter(p => p).map(p => p.Topics))
        }))

        const citations = [].concat.apply([], topicsCitedByPapers.map(p => p.citedTopics))
        this.topicsTable.data({
            data: this.model.topics.map(t => ({
                Topic: t.topic,
                Papers: filteredPapers.filter(p => p.Topics.includes(t.topic)).length,
                Citations: citations.filter(c => c == t.topic).length
            })),
            selected: { key: "Topic", value: this.model.selectedTopic }
        })

        const papersPerYear = d3.group(selectedTopicPapers, p => p.Year)
        const citationsPerYear = d3.group(topicsCitedByPapers, p => p.Year)

        const timeParser = d3.timeParse("%Y")
        let trendsData = []

        if (this.model.selectedTopic) {
            for (let i = this.model.years[0]; i <= this.model.years[1]; i++) {
                let papers = papersPerYear.get(String(i))
                papers = papers != null ? papers.length : 0
                let citations = citationsPerYear.get(String(i))
                citations = citations != null ? [].concat.apply([], citations.map(p => p.citedTopics)).filter(t => t == this.model.selectedTopic).length : 0
                trendsData.push({ year: timeParser(i), papers: papers, citations: citations })
            }
        }

        this.trendsChart.data(trendsData)
    }
}

export default new Controller()