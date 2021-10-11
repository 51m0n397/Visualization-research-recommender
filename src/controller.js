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

        const filteredPapers = this.model.papers.filter(p => this.model.conferences[p.Conference] && this.model.types[p.PaperType])

        this.papersTable.data({
            data: filteredPapers
                .filter(p => utils.arrayIntersection(p.Keywords, this.model.selectedKeywords).length > 0)
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
    }

    onConferencesChanged() {
        this.conferencesFilter.data({ name: 'Conferences', data: this.model.conferences })

        const filteredPapers = this.model.papers.filter(p => this.model.conferences[p.Conference] && this.model.types[p.PaperType])

        this.papersTable.data({
            data: filteredPapers
                .filter(p => utils.arrayIntersection(p.Keywords, this.model.selectedKeywords).length > 0)
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
    }

    onTypesChanged() {
        this.typeFilter.data({ name: 'Type', data: this.model.types })

        const filteredPapers = this.model.papers.filter(p => this.model.conferences[p.Conference] && this.model.types[p.PaperType])

        this.papersTable.data({
            data: filteredPapers
                .filter(p => utils.arrayIntersection(p.Keywords, this.model.selectedKeywords).length > 0)
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
    }
}

export default new Controller()