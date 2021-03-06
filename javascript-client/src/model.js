import * as utils from './utils'
import * as d3 from 'd3'

class Model {
    constructor() {
        this.colorScale = d3.scaleOrdinal(d3.schemePaired)

        this.papers = []
        this.papersById = {}

        this.keywords = []
        this.keywordsById = {}
        this.keywordsSorting = []
        this.keywordsTopics = {}
        this.keywordsPoints = []
        this.keywordsSortedByOccurrences = []

        this.occurreciesRange = []
        this.selectedOccurrences = []

        this.distanceRange = [0, 1]
        this.distaceThreshold = 0.73

        this.topics = []
        this.topicsById = []

        this.years = [Infinity, 0]

        this.selectedKeywords = []
        this.selectedTopic = null

        this.conferences = {}
        this.types = {}

        this.onKeywordsChanged = () => { }
        this.onThresholdChanged = () => { }
        this.onClusteringParamsChanged = () => { }
        this.onTopicsChanged = () => { }
    }

    bindKeywordsChanged(callback) {
        this.onKeywordsChanged = callback
    }

    bindThresholdChanged(callback) {
        this.onThresholdChanged = callback
    }

    bindClusteringParamsChanged(callback) {
        this.onClusteringParamsChanged = callback
    }

    bindTopicsChanged(callback) {
        this.onTopicsChanged = callback
    }

    setInitialData(papers) {
        papers.forEach((paper) => {
            paper.Authors = paper.Authors.split(';')
            paper.InternalReferences = paper.InternalReferences.split(';')
            paper.Keywords = paper.Keywords.split(';')

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

            paper.Keywords.forEach(k => {
                if (this.keywordsById[k] == null) {
                    this.keywords.push({ Keyword: k, Occurrences: 1, selected: true })
                    this.keywordsById[k] = this.keywords.length - 1
                } else {
                    this.keywords[this.keywordsById[k]].Occurrences++
                }
            })

            this.keywordsSorting = ['Occurrences', 1]
            this.occurreciesRange = d3.extent(this.keywords.map(k => k.Occurrences))
            this.selectedOccurrences = this.occurreciesRange.slice()
            this.selectedOccurrences[0] = 10
            this.selectedOccurrences[1] = 100
            this.keywordsSortedByOccurrences = [...this.keywords].sort((a, b) => d3.descending(a.Occurrences, b.Occurrences))
        })

        this.onKeywordsChanged()
        this.onThresholdChanged()
        this.onClusteringParamsChanged()
    }

    toggleKeyword(keyword) {
        const k = this.keywords[this.keywordsById[keyword]]
        k.selected = !k.selected
        this.onKeywordsChanged()
        this.onClusteringParamsChanged()
    }

    selectOccurrences(occurreciesRange) {
        this.selectedOccurrences = occurreciesRange
        this.onKeywordsChanged()
        this.onClusteringParamsChanged()
    }

    setDistanceThreshold(threshold) {
        this.distaceThreshold = threshold
        this.onThresholdChanged()
        this.onClusteringParamsChanged()
    }

    setTopics({topics, points}) {
        this.topics = []
        this.selectedKeywords = []
        this.selectedTopic = null

        this.keywordsTopics = {}

        topics.forEach(t => {
            const topic = this.keywordsSortedByOccurrences.find(k => t.includes(k.Keyword)).Keyword
            this.topics.push({Topic: topic, Keywords: t})
            this.topicsById[topic] = this.topics.length - 1

            t.forEach(k => this.keywordsTopics[k] = topic)
        })

        if (this.topics.length <= 12)
            this.colorScale.domain(this.topics.map(t => t.Topic))

        this.keywordsPoints = []
        this.keywords.filter(k =>
            k.Occurrences >= this.selectedOccurrences[0] &&
            k.Occurrences <= this.selectedOccurrences[1] &&
            k.selected
        ).forEach((k, i) => {
            this.keywordsPoints.push({
                keyword: k.Keyword, 
                x: points[i][0],
                y: points[i][1],
                topic: this.keywordsTopics[k.Keyword],
                color: this.topics.length <= 12 ? this.colorScale(this.keywordsTopics[k.Keyword]) : this.colorScale.range()[0]
            })
        })

        this.papers.forEach(p => {
            let topics = new Set()
            p.Keywords.forEach(k => {
                const topic = this.keywordsTopics[k]
                if (topic != null)
                topics.add(this.keywordsTopics[k])
            })
            p.Topics = Array.from(topics)
        })

        this.onTopicsChanged()
    }

    selectTopic(topic) {
        this.selectedTopic = topic
        this.selectedKeywords = this.topics[this.topicsById[topic]].Keywords
        this.onTopicsChanged()
    }

    selectKeywords(keywords) {
        this.selectedTopic = null
        this.selectedKeywords = keywords
        this.onTopicsChanged()
    }
    

    selectConferences(conference, checked) {
        this.conferences[conference] = checked
        this.onTopicsChanged()
    }

    selectType(type, checked) {
        this.types[type] = checked
        this.onTopicsChanged()
    }
    
}

export default new Model()