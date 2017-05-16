var User = require('mongoose').model('User');
var passport = require('passport');
var flash = require('../../include/utils').flash;

//  私有方法用于处理Mongoose错误对象并返回统一格式的错误消息
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
	var email = req.body.email;
	var password = req.body.password;
	var user = new User({
		username: username,
		email: email
	});
	var message = flash(null, null);

	User.register(user, password, function(error) {
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
		User.createUserToken(req.user.identity, function(err, usersToken) {
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