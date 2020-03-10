'use strict'

const express = require('express')
const route = express.Router()

const CurlController = require('../controllers/curl')

route.get('/curl/test', CurlController.test)
route.post('/curl/curl', CurlController.curl)

module.exports = route