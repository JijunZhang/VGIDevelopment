var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var User = require('mongoose').model('User');

module.exports = function() {
    passport.use(new localStrategy(function(username, password, done) {
        User.findOne({
            username: username
        }, function(err, user) {
            if (err) {
                return done(err);
            }

            if (!user) {
                return done(null, false, {
                    //用户名不存在
                    message: 'Unknown user'
                });
            }
            if (!user.authenticate(passport)) {
                return done(null, false, {
                    //密码不匹配
                    message: 'Invalid passport'
                });
            }

            return done(null, user);
        });
    }));
};