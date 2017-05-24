var config = require('./config'),
    express = require('express'),
    morgon = require('morgan'),
    compress = require('compression'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    passport = require('passport');

module.exports = function() {
    var app = express();

    if (process.env.NODE_ENV === 'development') {
        app.use(morgon('dev'));
    } else if (process.env.NODE_ENV === 'production') {
        app.use(compress());
    }

    app.use(bodyParser.urlencoded({
        extended: true
    }))
    app.use(bodyParser.json());
    app.use(methodOverride());

    app.use(passport.initialize());

    require('../app/routes/users.server.routes.js')(app);

    // Set Static Folder
    app.use(express.static('../public'));

    return app;
}