const Const = require('../const')
const Mangahere = require('./Mangahere')

async function search(req, res) {
    const site = req.body.site
    switch (site) {
        case Const.MANGAHERE: {
            const result = await Mangahere.search(req.body.name, req.body.page)
            res.json(result)
        }
        default:
            res.json()
    }
}

async function getInfo(req, res) {
    const site = req.body.site
    switch (site) {
        case Const.MANGAHERE: {
            const result = await Mangahere.getInfo(req.body.link)
            res.json(result)
        }
        default:
            res.json()
    }
}

async function getPages(req, res) {
    const site = req.body.site
    switch (site) {
        case Const.MANGAHERE: {
            const result = await Mangahere.getPages(req.body.link)
            res.json(result)
        }
        default:
            res.json()
    }
}

module.exports = {
    search: (req, res) => search(req, res),
    getInfo: (req, res) => getInfo(req, res),
    getPages: (req, res) => getPages(req, res),    
}