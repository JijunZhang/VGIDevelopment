var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('mongoose').model('User');

module.exports = function() {
    
    passport.use(new LocalStrategy(
        function(identity, password, done) {
            var query = new Query();
            query.setOptions({
                $or: [ { username: identity }, { email: identity } ]
            });
            
            User.findOne(query, function (err, user) {
            if (err) { return done(err); }
            if (!user) {
                return done(null, false, { message: 'Incorrect identity.' });
            }
            if (!user.validPassword(password)) {
                return done(null, false, { message: 'Incorrect password.' });
            }
                return done(null, user);
            });
        }
    ));
};