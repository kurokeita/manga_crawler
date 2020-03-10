'use strict'

const express = require('express')
const bodyParser = require("body-parser");
const cors = require("cors");
const routes = require('./routes/index')
const app = express()
const config = require('./config')
const port = config.PORT

app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(express.json())
app.use(cors())

app.use('/', routes)

app.listen(port, () => console.log('Server started on port ' + port))