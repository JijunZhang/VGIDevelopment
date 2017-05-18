var User = require('mongoose').model('User');
var passport = require('passport');
var flash = require('../../include/utils').flash;

// Create a new error handling controller method
var getErrorMessage = function(err) {
	// Define the error message variable
	var message = '';

	// If an internal MongoDB error occurs get the error message
	if (err.code) {
		switch (err.code) {
			// If a unique index error occurs set the message error
			case 11000:
			case 11001:
				message = 'Username already exists';
				break;
			// If a general error occurs set the message error
			default:
				message = 'Something went wrong';
		}
	} else {
		// Grab the first error message from a list of possible errors
		for (var errName in err.errors) {
			if (err.errors[errName].message) message = err.errors[errName].message;
		}
	}

	// Return the message error
	return message;
};

/**
* 用户注册控制方法/Post method to register a new user
*
* @param {Object} req the request object
* @param {Object} res the response object
*/ 
exports.register = function(req, res) {
	var username = req.body.username;
	var password = req.body.password;
	var user = new User({username: username});
	var message = flash(null, null);

	User.register(user, password, function(error, account) {
		if (error) {
                if (error.name === 'BadRequesterroror' && error.message && error.message.indexOf('exists') > -1) {
                    message = flash(null, 'Sorry. That username already exists. Try again.');
                }
                else if (error.name === 'BadRequesterroror' && error.message && error.message.indexOf('argument not set')) {
                    message =  flash (null, 'It looks like you\'re missing a required argument. Try again.');
                }
                else {
                    message = flash(null, 'Sorry. There was an error processing your request. Please try again or contact technical support.');
                }
                res.send(message);
            }
            else {
                //  用户成功注册
                res.send('Successfully registered user!');
            }
	});
};

/**
* 本地用户登录控制方法/Login method
* 
* @param {Object} req the request object
* @param {Object} res the response object
*/ 
exports.login = function(req, res) {
	if (req.user) {
		User.createUserToken(req.user.username, function(err, usersToken) {
			// console.log('token generated: ' +usersToken);
			// console.log(err);
			if (err) {
				//  生成Token值出错
				res.json({error: 'Issue generating token'});
			} else {
				res.json({token : usersToken});
			}
		});
	}
}

/**
* 本地用户登出控制方法/Logout method
* 
* @param {Object} req the request object
* @param {Object} res the response object
*/ 
exports.logout = function(req, res) {
	var messages = flash('Logged out', null);
	var incomingToken = req.headers.token;
	//console.log('LOGOUT: incomingToken: ' + incomingToken);
	if (incomingToken) {
		var decoded = User.decode(incomingToken);
		if (decoded && decoded.username) {
			//console.log("past first check...invalidating next...")
			User.invalidateUserToken(decoded.username, function(err, user) {
				//console.log('Err: ', err);
				//console.log('user: ', user);
				if (err) {
					//console.log(err);
					res.json({error: 'Issue finding user (in unsuccessful attempt to invalidate token).'});
				} else {
					///console.log("sending 200")
					res.json({message: 'logged out'});
				}
			});
		} else {
			//console.log('Whoa! Couldn\'t even decode incoming token!');
			res.json({error: 'Issue decoding incoming token.'});
		}
	}
}

/**
* 本地用户登出控制方法/Forgot method
* 
* @param {Object} req the request object
* @param {Object} res the response object
*/ 
exports.forgot = function(req, res) {
	Account.generateResetToken(req.body.username, function(err, user) {
		if (err) {
			res.json({error: 'Issue finding user.'});
		} else {
			var token = user.reset_token;
			res.json({token : token});
		}
	});
}