process.env.NODE_ENV = process.env.NODE_ENV || 'development'

var mongoose = require('./config/mongoose')
var express = require('./config/express')
var passport = require('./config/passport')

var db = mongoose()
var app = express()
var passport = passport()

var port = 3000

app.listen(port, function () {
  console.log('Server running at http://localhost:' + port + '/')
})

module.exports = app
