class Model {
    constructor() {
        this.keywords = []
        this.keywordsById = {}

        this.papers = []
        this.papersById = {}

        this.topics = []
        this.topicsById = {}

        this.selectedKeywords = []
        this.selectedTopic = null
        this.onSelectedTopicChanged = () => { }

        this.conferences = {}
        this.onConferencesChanged = () => { }

        this.types = {}
        this.onTypesChanged = () => { }

    }

    bindSelectedTopicChanged(callback) {
        this.onSelectedTopicChanged = callback
    }

    bindConferencesChanged(callback) {
        this.onConferencesChanged = callback
    }

    bindTypesChanged(callback) {
        this.onTypesChanged = callback
    }

    setKeywords(keywords) {
        keywords.forEach((keyword) => {
            this.keywords.push(keyword)
            this.keywordsById[keyword.keyword] = this.keywords.length - 1

            if (this.topicsById[keyword.topic] == null) {
                this.topics.push({ topic: keyword.topic, keywords: [keyword.keyword] })
                this.topicsById[keyword.topic] = this.topics.length - 1
            } else
                this.topics[this.topicsById[keyword.topic]].keywords.push(keyword.keyword)
        })
        this.selectedKeywords = keywords
    }

    setPapers(papers) {
        papers.forEach((paper) => {
            paper.Authors = paper.Authors.split(';')
            paper.InternalReferences = paper.InternalReferences.split(';')
            paper.Keywords = paper.Keywords.split(';')

            this.papers.push(paper)
            this.papersById[paper.DOI] = this.papers.length - 1

            if (this.conferences[paper.Conference] == null) {
                this.conferences[paper.Conference] = true
            }

            if (this.types[paper.PaperType] == null) {
                this.types[paper.PaperType] = true
            }
        })
        this.onConferencesChanged()
        this.onTypesChanged()
    }

    selectTopic(topic) {
        this.selectedTopic = topic
        this.selectedKeywords = this.topics[this.topicsById[topic]].keywords
        this.onSelectedTopicChanged()
    }
}

export default new Model()