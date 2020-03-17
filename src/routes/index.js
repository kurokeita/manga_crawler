'use strict'

const express = require('express')
const route = express.Router()

const ActionController = require('../controllers/action')
const CurlController = require('../controllers/curl')

route.get('/curl/test', CurlController.test)
route.post('/curl/curl', CurlController.curl)
route.post('/curl/search', CurlController.search)

route.post('/manga/search', ActionController.search)
route.post('/manga/getinfo', ActionController.getInfo)
route.post('/manga/getpages', ActionController.getPages)

route.get('/testAPI', (req, res) => {
    console.log(req.headers)
    res.json(req.headers)
})

module.exports = route