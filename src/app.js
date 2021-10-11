import * as d3 from 'd3'

import controller from './controller'

const app = function () {
    window.app = controller
    loadData().then(() => {
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
