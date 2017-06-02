var passport = require('passport')
var User = require('mongoose').model('User')

module.exports = function () {
  passport.use(User.createStrategy())
}
