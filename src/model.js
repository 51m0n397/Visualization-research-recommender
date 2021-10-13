import * as utils from './utils'
import * as d3 from 'd3'

class Model {
    constructor() {
        this.colorScale = d3.scaleOrdinal(d3.schemePaired)

        this.keywords = []
        this.keywordsById = {}

        this.papers = []
        this.papersById = {}

        this.topics = []
        this.topicsById = {}

        this.authors = []
        this.authorsById = {}

        this.hIndexRange = [Infinity, 0]
        this.selectedHindex = []

        this.years = [Infinity, 0]

        this.selectedKeywords = []
        this.selectedTopic = null

        this.conferences = {}

        this.types = {}

        this.onDataChanged = () => { }
    }

    bindDataChanged(callback) {
        this.onDataChanged = callback
    }

    setInitialData(keywords, papers) {
        this.colorScale.domain(keywords.map(k => k.topic))

        keywords.forEach((keyword) => {
            keyword.color = this.colorScale(keyword.topic)
            this.keywords.push(keyword)
            this.keywordsById[keyword.keyword] = this.keywords.length - 1

            if (this.topicsById[keyword.topic] == null) {
                this.topics.push({ topic: keyword.topic, keywords: [keyword.keyword], color: keyword.color })
                this.topicsById[keyword.topic] = this.topics.length - 1
            } else
                this.topics[this.topicsById[keyword.topic]].keywords.push(keyword.keyword)
        })

        papers.forEach((paper) => {
            paper.Authors = paper.Authors.split(';')
            paper.InternalReferences = paper.InternalReferences.split(';')
            paper.Keywords = paper.Keywords.split(';')
            paper.Topics = this.topics.filter(t => utils.arrayIntersection(t.keywords, paper.Keywords).length > 0).map(t => t.topic)
            paper.Citations = 0
            paper.bestHIndex = 0

            this.papers.push(paper)
            this.papersById[paper.DOI] = this.papers.length - 1

            if (+paper.Year < this.years[0]) this.years[0] = +paper.Year
            if (+paper.Year > this.years[1]) this.years[1] = +paper.Year

            if (this.conferences[paper.Conference] == null) {
                this.conferences[paper.Conference] = true
            }

            if (this.types[paper.PaperType] == null) {
                this.types[paper.PaperType] = true
            }
        })

        this.papers.forEach(p => {
            p.InternalReferences.forEach(c => {
                const citedPaper = this.papers[this.papersById[c]]
                if (citedPaper)
                    citedPaper.Citations++
            })
        })

        this.papers.forEach(p => {
            p.Authors.forEach(a => {
                if (this.authorsById[a] == null) {
                    this.authors.push({ author: a, papers: [{ paper: p.DOI, citations: p.Citations }] })
                    this.authorsById[a] = this.authors.length - 1
                } else {
                    this.authors[this.authorsById[a]].papers.push({ paper: p.DOI, citations: p.Citations })
                }
            })
        })

        this.authors.forEach(a => {
            a.hIndex = 0
            const citations = [...(new Set(a.papers.map(p => p.citations)))].sort(d3.ascending)
            for (let i = 0; i < citations.length; i++) {
                if (a.papers.filter(p => p.citations >= citations[i]).length >= citations[i])
                    a.hIndex = citations[i]
                else break
            }

            a.papers.forEach(p => {
                const paper = this.papers[this.papersById[p.paper]]
                if (a.hIndex > paper.bestHIndex)
                    paper.bestHIndex = a.hIndex
            })
            
            if (a.hIndex < this.hIndexRange[0]) this.hIndexRange[0] = a.hIndex
            if (a.hIndex > this.hIndexRange[1]) this.hIndexRange[1] = a.hIndex
        })

        this.selectedHindex = this.hIndexRange

        this.onDataChanged()
    }

    selectTopic(topic) {
        this.selectedTopic = topic
        this.selectedKeywords = this.topics[this.topicsById[topic]].keywords
        this.onDataChanged()
    }

    selectKeywords(keywords) {
        this.selectedTopic = null
        this.selectedKeywords = keywords
        this.onDataChanged()
    }

    selectConferences(conference, checked) {
        this.conferences[conference] = checked
        this.onDataChanged()
    }

    selectType(type, checked) {
        this.types[type] = checked
        this.onDataChanged()
    }

    selectHindex(hIndexRange) {
        this.selectedHindex = hIndexRange
        this.onDataChanged()
    }
}

export default new Model()