const express = require('express')
const bodyParser = require('body-parser')
const postgres = require('postgres')
const bcrypt = require('bcrypt')

const app = express()
app.use(bodyParser.urlencoded())

app.post('/calculate', (req, res) => {

})

app.post('/login', (req, res) => {

})

app.listen(3000)
console.log("Serving on port 3000")
