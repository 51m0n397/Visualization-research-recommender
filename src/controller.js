import query from 'sql-js'
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

        this.model.bindSelectedTopicChanged(this.onSelectedTopicChanged.bind(this))
        this.model.bindConferencesChanged(this.onConferencesChanged.bind(this))
        this.model.bindTypesChanged(this.onTypesChanged.bind(this))

        this.topicsTable.bindClick((topic) => {
            this.model.selectTopic(topic.Topic)
        }).bind(this)

        this.conferencesFilter.bindClick((conference, checked) => {
            this.model.conferences[conference] = checked
            this.onConferencesChanged()
        }).bind(this)

        this.typeFilter.bindClick((type, checked) => {
            this.model.types[type] = checked
            this.onSelectedTopicChanged()
        }).bind(this)
    }

    handleLoadData(keywords, papers) {
        this.model.setKeywords(keywords)
        this.model.setPapers(papers)
        this.topicsTable.data({
            data: this.model.topics.map(t => ({ Topic: t.topic })),
            selected: null
        })

        this.keywordsPlot.data({
            data: this.model.keywords.map(k => ({
                x: +k.x, y: +k.y,
                label: k.keyword,
                class: k.topic,
                size: this.model.papers.filter(p => p.Keywords.includes(k.keyword)).length
            })),
            selected: null
        })
    }

    onSelectedTopicChanged() {
        this.topicsTable.data({
            data: this.model.topics.map(t => ({ Topic: t.topic })),
            selected: { key: "Topic", value: this.model.selectedTopic }
        })

        this.onDataChanged()
    }

    onConferencesChanged() {
        this.conferencesFilter.data({ name: 'Conferences', data: this.model.conferences })

        this.onDataChanged()
    }

    onTypesChanged() {
        this.typeFilter.data({ name: 'Type', data: this.model.types })

        this.onDataChanged()
    }

    onDataChanged() {
        const filteredPapers = this.model.papers.filter(p => this.model.conferences[p.Conference] && this.model.types[p.PaperType])
        const topicPapers = filteredPapers.filter(p => utils.arrayIntersection(p.Keywords, this.model.selectedKeywords).length > 0)
        const timeParser = d3.timeParse("%Y")

        this.papersTable.data({
            data: topicPapers
                .map(p => ({
                    Title: p.Title,
                    Authors: p.Authors.join(', '),
                    Conference: p.Conference,
                    "Paper type": p.PaperType,
                    Year: p.Year,
                    Keywords: p.Keywords.join(', ')
                }))
        })

        this.keywordsPlot.data({
            data: this.model.keywords.map(k => ({
                x: +k.x, y: +k.y,
                label: k.keyword,
                class: k.topic,
                size: filteredPapers.filter(p => p.Keywords.includes(k.keyword)).length
            })),
            selected: this.model.selectedTopic
        })

        if (topicPapers.length > 0) {
            const papersPerYear = Object.fromEntries(query()
                .select()
                .from(topicPapers)
                .groupBy(p => p.Year)
                .execute())

            // topics cited by papers
            const papersCitedTopics = this.model.papers.map(p => ({
                year: p.Year,
                topics: new Set(p.InternalReferences.map(r => {
                    // replacing list of citations with list of keywords of the cited papers
                    const id = this.model.papersById[r]
                    if (id != undefined && filteredPapers.includes(this.model.papers[id]))
                        return this.model.papers[id].Keywords
                    else return []
                }).flat(1).map(k => {
                    // replacing keywords with topics
                    const id = this.model.keywordsById[k]
                    if (id != undefined) return this.model.keywords[id].topic
                    else return id
                }).filter(t => t))
            }))

            const citationsPerYear = Object.fromEntries(query()
                .select()
                .from(papersCitedTopics.filter(p => p.topics.has(this.model.selectedTopic)))
                .groupBy(p => p.year)
                .execute())

            const years = query()
                .select()
                .from(this.model.papers)
                .groupBy(p => p.Year)
                .execute()
                .map(x => x[0])

            let data = []

            for (let i = Math.min(...years); i <= Math.max(...years); i++) {
                const papers = papersPerYear[i] != null ? papersPerYear[i].length : 0
                const citations = citationsPerYear[i] != null ? citationsPerYear[i].length : 0
                data.push({ year: timeParser(i), papers: papers, citations: citations })
            }

            this.trendsChart.data(data)
        } else this.trendsChart.data([])
    }
}

export default new Controller()