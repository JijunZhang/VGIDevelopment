const express = require('express')
const morgon = require('morgan')
const compress = require('compression')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const passport = require('passport')

const api = require('../app/api/index.server.api')

module.exports = function() {
    var app = express()

    if (process.env.NODE_ENV === 'development') {
        app.use(morgon('dev'))
    } else if (process.env.NODE_ENV === 'production') {
        app.use(compress())
    }


    app.use(bodyParser.urlencoded({
        extended: true
    }))
    app.use(bodyParser.json())
    app.use(methodOverride())

    app.use(passport.initialize())

    app.use('/api', api)
    require('../app/routes/users.server.routes.js')(app)
    require('../app/routes/mapLabel.server.routes.js')(app)
    require('../app/routes/task.server.routes.js')(app)

    // Set Static Folder
    app.use(express.static('../public'))

    return app
}