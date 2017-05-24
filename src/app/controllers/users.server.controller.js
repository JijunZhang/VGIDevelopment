var User = require('mongoose').model('User');
var passport = require('passport');
var flash = require('../../utils/utils').flash;

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
    var user = new User({ username: username });
    var message = flash(null, null);
    console.log(user);

    User.register(user, password, function(error, account) {
        if (error) {
            if (error.name === 'BadRequesterroror' && error.message && error.message.indexOf('exists') > -1) {
                message = flash(null, 'Sorry. That username already exists. Try again.');
            } else if (error.name === 'BadRequesterroror' && error.message && error.message.indexOf('argument not set')) {
                message = flash(null, 'It looks like you\'re missing a required argument. Try again.');
            } else {
                message = flash(null, 'Sorry. There was an error processing your request. Please try again or contact technical support.');
            }
            res.status(400).json({ error: message.err });
        } else {
            //  用户成功注册
            message = flash('Successfully registered user!', null);
            res.status(200).json({ info: message.info });
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
    if (req.user && req.user.loginStatus === 0) {
        User.createUserToken(req.user.username, function(err, usersToken) {
            // console.log('token generated: ' +usersToken);
            // console.log(err);
            if (err) {
                //  生成Token值出错
                res.status(400).json({ error: 'Issue generating token' });
            } else {
                res.status(200).json({ token: usersToken });
            }
        });
    } else {
        res.status(400).json({ error: 'The user is logged in.' });
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
                    res.status(400).json({ error: 'Issue finding user (in unsuccessful attempt to invalidate token).' });
                } else {
                    ///console.log("sending 200")
                    res.status(200).json({ info: 'logged out' });
                }
            });
        } else {
            //console.log('Whoa! Couldn\'t even decode incoming token!');
            res.status(400).json({ error: 'Issue decoding incoming token.' });
        }
    }
}

/**
 * 本地用户忘记密码控制方法/Forgot method
 * 
 * @param {Object} req the request object
 * @param {Object} res the response object
 */
exports.forgot = function(req, res) {
    User.generateResetToken(req.body.username, function(err, user) {
        if (err) {
            res.status(400).json({ error: 'Issue finding user.' });
        } else {
            var resetToken = user.reset_token;
            res.status(200).json({ resetToken: resetToken });
        }
    });
}

/**
 * 本地用户忘记密码后重置控制方法/ForgotAndReset method
 * 
 * @param {Object} req the request object
 * @param {Object} res the response object
 */
exports.forgotAndReset = function(req, res) {
    var incomingResetToken = req.body.resetToken;
    var newPassword = req.body.new_password;
    var confirmationPassword = req.body.confirm_new_password;
    // console.log('Forgot and reset password: incomingToken: ' + incomingToken);
    // console.log("newPassword: ", newPassword);
    // console.log("confirmationPassword: ", confirmationPassword);
    if (incomingResetToken && (newPassword === confirmationPassword)) {
        User.findUserByResetTokenOnly(incomingResetToken, function(err, user) {
            // console.log(err);
            var currentTime = Date.now();
            var expiredTime = user.reset_token_expires_millis;
            console.log(currentTime);
            console.log(user);
            console.log(expiredTime);
            if (currentTime < expiredTime) {
                user.setPassword(newPassword, function(err, user) {
                    if (err) {
                        console.log("error: ", err);
                        res.status(400).json({ err: 'Issue while setting new password.' });
                    }
                    //重设密码后，销毁原先生成的token值，改变登录状态
                    user.token = null;
                    user.loginStatus = 0;
                    user.save(function(err, usr) {
                        if (err) {
                            cb(err, null);
                        } else {
                            //  客户端需要重新登陆以重新获取令牌
                            res.status(200).json({ info: 'Password reset.' });
                        }
                    });
                });
            } else {
                res.status(400).json({ error: 'Reset token expired.' });
            }
        });
    }
}

/**
 * 本地用户重置密码控制方法/Forgot method
 * 
 * @param {Object} req the request object
 * @param {Object} res the response object
 */
exports.resetPassword = function(req, res) {
    console.log("GOT IN")
    var username = req.body.username;
    var currentPassword = req.body.current_password;
    var newPassword = req.body.new_password;
    var confirmationPassword = req.body.confirm_new_password;
    // console.log("username: ", username);
    // console.log("currentPassword: ", currentPassword);
    // console.log("newPassword: ", newPassword);
    // console.log("confirmationPassword: ", confirmationPassword);

    if (username && currentPassword && newPassword && confirmationPassword && (newPassword === confirmationPassword)) {

        User.findUserByUsernameOnly(username, function(err, user) {
            if (err) {
                console.log("error: ", err);
                res.status(400).json({ err: 'Issue while finding user.' });
            } else if (!user) {
                console.log("Unknown user");
                res.status(400).json({ err: 'Unknown username: ' + username });
            } else if (user) {
                console.log("FOUND USER .. now going call User.authenticate...");
                User.authenticate()(username, currentPassword, function(err, isMatch, options) {
                    if (err) {
                        console.log("error: ", err);
                        res.status(400).json({ err: 'Error while verifying current password.' });
                    } else if (!isMatch) {
                        res.status(400).json({ err: 'Current password does not match' });
                    } else {
                        user.setPassword(newPassword, function(err, user) {
                            if (err) {
                                console.log("error: ", err);
                                res.status(400).json({ err: 'Issue while setting new password.' });
                            }
                            user.token = null;
                            user.loginStatus = 0;
                            user.save(function(err, usr) {
                                if (err) {
                                    cb(err, null);
                                } else {
                                    //  客户端需要重新登陆以重新获取令牌
                                    res.status(200).json({ info: 'Password updated.' });
                                }
                            });
                        });
                    }
                });
            }
        });
    } else {
        //TODO Better error message,etc.
        res.json({ error: 'Missing username, current, new, or confirmation password, OR, the confirmation does not match.' });
    }
}