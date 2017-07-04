var User = require('../models/user.server.model')
var passport = require('passport')
var flash = require('../../utils/utils').flash
var config = require('../../config/config')
var fs = require('fs')

// Create a new error handling controller method
var getErrorMessage = function(err) {
    // Define the error message variable
    var message = ''

    // If an internal MongoDB error occurs get the error message
    if (err.code) {
        switch (err.code) {
            // If a unique index error occurs set the message error
            case 11000:
            case 11001:
                message = 'Username already exists'
                break
                // If a general error occurs set the message error
            default:
                message = 'Something went wrong'
        }
    } else {
        // Grab the first error message from a list of possible errors
        for (var errName in err.errors) {
            if (err.errors[errName].message) message = err.errors[errName].message
        }
    }

    // Return the message error
    return message
}

/**
 * 用户注册控制方法/Post method to register a new user
 *
 * @param {Object} req the request object
 * @param {Object} res the response object
 */
exports.register = function(req, res) {
    var username = req.body.username
    var password = req.body.password
        // console.log(username)
        // console.log(password)
    var user = new User({ username: username })
    var message = flash(null, null)
        // console.log(user)

    User.register(user, password, function(error, account) {
        if (error) {
            // console.log(error)
            if (error.name === 'BadRequesterroror' && error.message && error.message.indexOf('exists') > -1) {
                message = flash(null, 'Sorry. That username already exists. Try again.')
            } else if (error.name === 'BadRequesterroror' && error.message && error.message.indexOf('argument not set')) {
                message = flash(null, 'It looks like you\'re missing a required argument. Try again.')
            } else {
                message = flash(null, 'Sorry. There was an error processing your request. Please try again or contact technical support.')
            }
            res.status(400).json({ error: message.err })
        } else {
            //  用户成功注册
            message = flash('Successfully registered user!', null)
            res.status(200).json({
                status: {
                    code: 200,
                    message: '用户成功注册'
                }
            })
        }
    })
}

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
                res.status(400).json({ error: 'Issue generating token' })
            } else {
                res.status(200).json({ token: usersToken })
            }
        })
    } else {
        res.status(400).json({ error: 'The user is logged in.' })
    }
}

/**
 * 本地用户登出控制方法/Logout method
 *
 * @param {Object} req the request object
 * @param {Object} res the response object
 */
exports.logout = function(req, res) {
    var messages = flash('Logged out', null)
    User.invalidateUserToken(req.user.username, function(err, user) {
        // console.log('user: ', user)
        if (err) {
            console.log(err)
            res.json({ error: 'Issue finding user (in unsuccessful attempt to invalidate token).' })
        } else {
            res.json({ message: 'logged out' })
        }
    })
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
            res.status(400).json({ error: 'Issue finding user.' })
        } else {
            var resetToken = user.reset_token
            res.status(200).json({ resetToken: resetToken })
        }
    })
}

/**
 * 本地用户忘记密码后重置控制方法/ForgotAndReset method
 *
 * @param {Object} req the request object
 * @param {Object} res the response object
 */
exports.forgotAndReset = function(req, res) {
    var incomingResetToken = req.body.resetToken
    var newPassword = req.body.new_password
    var confirmationPassword = req.body.confirm_new_password
        // console.log('Forgot and reset password: incomingToken: ' + incomingToken);
        // console.log("newPassword: ", newPassword);
        // console.log("confirmationPassword: ", confirmationPassword);
    if (incomingResetToken && (newPassword === confirmationPassword)) {
        User.findUserByResetTokenOnly(incomingResetToken, function(err, user) {
            // console.log(err);
            var currentTime = Date.now()
            var expiredTime = user.reset_token_expires_millis
            console.log(currentTime)
            console.log(user)
            console.log(expiredTime)
            if (currentTime < expiredTime) {
                user.setPassword(newPassword, function(err, user) {
                    if (err) {
                        console.log('error: ', err)
                        res.status(400).json({ err: 'Issue while setting new password.' })
                    }
                    // 重设密码后，销毁原先生成的token值，改变登录状态
                    user.token = null
                    user.loginStatus = 0
                    user.save(function(err, usr) {
                        if (err) {
                            cb(err, null)
                        } else {
                            //  客户端需要重新登陆以重新获取令牌
                            res.status(200).json({ info: 'Password reset.' })
                        }
                    })
                })
            } else {
                res.status(400).json({ error: 'Reset token expired.' })
            }
        })
    }
}

/**
 * 本地用户重置密码控制方法/Forgot method
 *
 * @param {Object} req the request object
 * @param {Object} res the response object
 */
exports.resetPassword = function(req, res) {
    console.log('GOT IN')
    var username = req.body.username
    var currentPassword = req.body.current_password
    var newPassword = req.body.new_password
    var confirmationPassword = req.body.confirm_new_password
        // console.log("username: ", username);
        // console.log("currentPassword: ", currentPassword);
        // console.log("newPassword: ", newPassword);
        // console.log("confirmationPassword: ", confirmationPassword);

    // 利用req.user中的信息来判断输入用户名和原始密码的正确性
    if (username && currentPassword && newPassword && confirmationPassword && (newPassword === confirmationPassword)) {
        User.findUserByUsernameOnly(username, function(err, user) {
            if (err) {
                console.log('error: ', err)
                res.status(400).json({ err: 'Issue while finding user.' })
            } else if (!user) {
                console.log('Unknown user')
                res.status(400).json({ err: 'Unknown username: ' + username })
            } else if (user) {
                console.log('FOUND USER .. now going call User.authenticate...')
                User.authenticate()(username, currentPassword, function(err, isMatch, options) {
                    if (err) {
                        console.log('error: ', err)
                        res.status(400).json({ err: 'Error while verifying current password.' })
                    } else if (!isMatch) {
                        res.status(400).json({ err: 'Current password does not match' })
                    } else {
                        user.setPassword(newPassword, function(err, user) {
                            if (err) {
                                console.log('error: ', err)
                                res.status(400).json({ err: 'Issue while setting new password.' })
                            }
                            user.token = null
                            user.loginStatus = 0
                            user.save(function(err, usr) {
                                if (err) {
                                    cb(err, null)
                                } else {
                                    //  客户端需要重新登陆以重新获取令牌
                                    res.status(200).json({ info: 'Password updated.' })
                                }
                            })
                        })
                    }
                })
            }
        })
    } else {
        // TODO Better error message,etc.
        res.json({ error: 'Missing username, current, new, or confirmation password, OR, the confirmation does not match.' })
    }
}

// 验证token的中间件
// 步骤：检查附上的token，试图解密，验证token的可用性
// 如果token是合法的，检索里面用户的信息，以及附加到请求的对象上
exports.jwtAuth = function(req, res, next) {
    // 为了获得最大的可扩展性
    // 使用一下3个方法附加我们的token：
    // 作为请求链接（query)的参数，作为主体的参数（body），
    // 和作为请求头（Header）的参数
    //console.log('Starting jwtAuth ......')
    //console.log(req.headers['x-access_token'])
    var incomingToken = (req.body && req.body.access_token) || req.query.access_token || req.headers['x-access_token']
        //console.log(incomingToken)
    if (incomingToken) {
        // 解析token值
        var decoded = User.decode(incomingToken)
            // console.log(decoded)
            // console.log(decoded.username)
            // console.log(decoded.date_created)
        if (decoded && decoded.username && decoded.date_created) {
            // 根据解析后的decoded获取用户信息
            if (User.hasExpired(decoded.date_created)) {
                // token值过期时，销毁token值，退出登录
                // 前台考虑退出登录问题
                User.invalidateUserToken(decoded.username)
                return res.status(400).send('Access token has expires')
            }

            User.findUser(decoded.username, incomingToken, function(err, user) {
                if (!err) {
                    // 取出用户信息
                    req.user = user
                        // 用于验证用户是否取出
                        // console.log(user);
                    return next()
                }
            })
        } else {
            // 可写一些输出的错误信息
            return res.json({
                status: {
                    code: 400,
                    message: 'token值解析出错'
                }
            })
        }
    } else {
        // 可写一些输出的错误信息
        return res.json({
            status: {
                code: 400,
                message: '没有传入token值'
            }
        })
    }
}

// 中间件，用于检验token之后，检查req.user是否为已认证用户
exports.requireAuth = function(req, res, next) {
    if (!req.user) {
        return res.status(401).send('Not authorized')
    } else {
        next()
    }
}

//用户获取所有地图标记信息
//获取标记信息，按照地图标记创建的_id排序
exports.getAllMapLabel = function(req, res) {
    User.find({}, { _id: 0, username: 1, user_mapLabel: 1 }).populate({
        path: 'user_mapLabel',
        select: { labelMessage: 1 },
        options: { sort: { _id: -1 } }
    }).exec(function(err, userMapLabels) {
        if (err) {
            return res.json({
                status: {
                    code: 400,
                    message: '获取地图标记信息失败'
                }
            })
        }

        //提取字段；此for循环可用于删除某些不必要返回的字段，
        //此处在select处进行提取即可

        // for (var i = 0, n = userMapLabels.length; i < n; i++) {

        //     for (var j = 0, m = userMapLabels[i].user_mapLabel.length; j < m; j++) {
        //         console.log('userMapLabel.user_mapLabel[0]:' + userMapLabels[i].user_mapLabel[0])

        //         console.log('userMapLabel.user_mapLabel type:' + typeof(userMapLabels[i].user_mapLabel))
        //         console.log('userMapLabels[i] _id:' + userMapLabels[i].user_mapLabel[j]['_id'])
        //             //删除不需要返回的字段
        //             //delete userMapLabels[i].user_mapLabel[j]['coordinate']
        //             //delete userMapLabels[i].user_mapLabel[j]['address']

        //     }
        //     // delete userMapLabels[i]['token']
        //     // delete userMapLabels[i]['_id']
        //     // delete userMapLabels[i]['loginStatus']

        // }
        //console.log(userMapLabels[0])
        //返回信息，只包含labelMessage信息
        //并且按照按照地图标记创建的_id排序
        if (userMapLabels) {
            res.json({
                status: {
                    code: 200,
                    message: '成功获取所有的地图标记'
                },
                data: userMapLabels
            })
        } else {
            return res.json({
                status: {
                    code: 400,
                    message: '没有提取出所有地图标记的信息'
                }
            })
        }

    })
}

//获取某个特定用户的单个地图标记，此function暂时无用
//userMapLabel为查找出来的用户
exports.getSingleMapLabelFronOne = function(req, res) {
    //使用token获取req.user，不需要在路由中传入username
    //var username = req.params.username
    var mapLabelId = req.params.mapLabelId
    var username = req.user.username
        //console.log('username:' + username)
        //console.log('mapLabelId:' + mapLabelId)
    User.find({ username: username }, { _id: 0, username: 1, user_mapLabel: 1 }).populate({
        path: 'user_mapLabel',
        select: { labelPerson: 0 }
    }).exec(function(err, userMapLabel) {
        if (err) {
            return res.json({
                status: {
                    code: 400,
                    message: '获取某个用户' + username + '的单个地图标记' + mapLabelId + '信息失败'
                }
            })
        }
        //虽然userMapLabel长度为1，是一个单一的用户信息，但是要使用两个for循环来进行id的判断
        //要使用userMapLabel[i].user_mapLabel[j]['_id']来提取id的值，此处提取的数值为object类型
        //所以进行比较是，要使用toString()方法
        //提取user_mapLabel字段时，也要使用userMapLabel[0].user_mapLabel类似的样式，否则提取字段为undefine
        for (var i = 0, n = userMapLabel.length; i < n; i++) {
            for (var j = 0, m = userMapLabel[i].user_mapLabel.length; j < m; j++) {
                // console.log('userMapLabel.user_mapLabel[0]:' + userMapLabel[i].user_mapLabel[0])
                // console.log('userMapLabel.user_mapLabel type:' + typeof(userMapLabel[i].user_mapLabel))
                // console.log('userMapLabel.length:' + userMapLabel.length)
                //console.log('userMapLabel.user_mapLabel.length:' + userMapLabel[i].user_mapLabel.length)
                //console.log('userMapLabel[i].user_mapLabel[j] _id' + typeof(userMapLabel[i].user_mapLabel[j]['_id']))
                //判断id是否相同
                if (mapLabelId === userMapLabel[i].user_mapLabel[j]['_id'].toString()) {
                    var mapLabel = userMapLabel[i].user_mapLabel[j]
                    break
                }
            }
        }
        // console.log('mapLabel:' + mapLabel)
        //返回单个地图标记信息，此信息中不包含labelPerson字段
        if (mapLabel) {
            res.json({
                status: {
                    code: 200,
                    message: '成功获取指定用户所查看的单个地图标记'
                },
                data: mapLabel
            })
        } else {
            res.json({
                status: {
                    code: 400,
                    message: '没有提取出指定用户' + username + '所查看的单个地图标记' + mapLabelId + '信息'
                }
            })
        }
    })
}

//用户获取某个地图标记信息，可以获取自己的也可以获取别人的
//此时不需要传入username来查找特定的用户
exports.getSingleMapLabelFromAnyOne = function(req, res) {

    var mapLabelId = req.params.mapLabelId
    var username = req.user.username

    User.find({}, { _id: 0, username: 1, user_mapLabel: 1 }).populate({
        path: 'user_mapLabel',
        select: { labelPerson: 0 }
    }).exec(function(err, userMapLabels) {
        if (err) {
            return res.json({
                status: {
                    code: 400,
                    message: '用户' + username + '获取地图标记' + mapLabelId + '信息失败'
                }
            })
        }
        //获取需要的地图标记信息
        for (var i = 0, n = userMapLabels.length; i < n; i++) {
            for (var j = 0, m = userMapLabels[i].user_mapLabel.length; j < m; j++) {
                //判断id是否相同
                if (mapLabelId === userMapLabels[i].user_mapLabel[j]['_id'].toString()) {
                    var mapLabel = userMapLabels[i].user_mapLabel[j]
                    break
                }
            }
        }
        // console.log('mapLabel:' + mapLabel)
        //返回单个地图标记信息，此信息中不包含labelPerson字段
        if (mapLabel) {
            res.json({
                status: {
                    code: 200,
                    message: '用户' + username + '成功获取所查看的单个地图标记'
                },
                data: mapLabel
            })
        } else {
            res.json({
                status: {
                    code: 400,
                    message: '用户' + username + '没有提取出所查看的单个地图标记' + mapLabelId + '信息'
                }
            })
        }
    })
}

//更新用户信息，
//包括email,age,gender,location,occupation,speciality,telephone
exports.updateUserInfo = function(req, res) {
    //取出要更新的用户，req.user由token值出取出
    var user = req.user

    //更新此用户的信息
    user.email = req.body.email || ''
    user.age = req.body.age || ''
    user.gender = req.body.gender || ''
    user.location = req.body.location || ''
    user.occupation = req.body.occupation || ''
    user.speciality = req.body.speciality || ''
    user.telephone = req.body.telephone || ''

    //当字段gender为boolen类型时，需要进行判断
    // if (req.body.gender === '男') {
    //     user.gender = true
    // } else if (req.body.gender === '女') {
    //     user.gender = false
    // } else {
    //     user.gender = null
    // }

    //保存更新的用户信息
    user.save(function(err) {
        //更新成功则返回用户的更新信息以及用户名
        if (err) {
            return res.json({
                status: {
                    code: 400,
                    message: '更新用户' + user.username + '信息失败'
                }
            })
        } else {
            //剔除不需要返回的数据
            User.findOne({ username: user.username }, { _id: 0, token: 0 }, function(err, usr) {
                res.json({
                    status: {
                        code: 200,
                        message: '更新用户' + user.username + '信息成功'
                    },
                    data: usr
                })
            })

        }
    })
}

//取出用户信息，剔除掉敏感字段
exports.getUserInfo = function(req, res) {

    //取出要更新的用户，req.user由token值出取出
    var user = req.user
    User.find({ username: user.username }, { _id: 0, token: 0 }, function(err, usr) {
        if (err) {
            return res.json({
                status: {
                    code: 400,
                    message: '取出用户' + user.username + '信息失败'
                }
            })
        }

        res.json({
            status: {
                code: 200,
                message: '取出用户' + user.username + '信息成功'
            },
            data: usr
        })
    })
}

//上传头像
exports.uploadAvatar = function(req, res) {
    //使用利用token获取的用户信息
    var user = req.user
    var file = req.file


    //如果用户头像名称不存在，则进行第一次上传头像事件，即将字段名保存在用户的avatar字段中
    //并且将头像保存在相应的位置；如果头像名称已经存在，则进行修改头像事件，删除原头像，将字段
    //avatar中保存的头像名称改变为修改之后的，然后再次保存用户信息
    if (!user.avatar) {
        //保存头像信息
        saveAvatar(res, user, file)
    } else {
        //提取原始头像的路径
        var oldAvatarName = user.avatar
        var oldAvatarPath = config.upload.path + '/' + oldAvatarName
        oldAvatarPath = oldAvatarPath.replace(/\//g, '\\')
            //console.log('oldAvatarPath:' + oldAvatarPath)

        //删除原始头像    此处使用res.json会报错，提示未设置头部
        //此处要再看看文件模块信息
        fs.exists(oldAvatarPath, function(existAvatar) {
            if (existAvatar) {
                fs.unlink(oldAvatarPath, function(err) {
                    if (err) {
                        console.log('没有删除原始头像，修改头像失败')
                    }

                })
            } else {
                console.log('原始头像不存在')
            }
        })

        //保存修改之后的头像
        saveAvatar(res, user, file)
    }
}

function saveAvatar(res, user, file) {
    if (file.filename) {
        //保存用户的头像名称
        user.avatar = file.filename
        user.save(function(err) {
            if (err) {
                return res.json({
                    status: {
                        code: 400,
                        message: '头像上传成功，但是保存头像名称失败'
                    }
                })
            } else {
                res.json({
                    status: {
                        code: 200,
                        message: '在数据库中保存头像名称成功'
                    },
                    data: file.filename //此处返回信息根据前台需要可修改
                })
            }
        })
    } else {
        res.json({
            status: {
                code: 200,
                message: '头像上传失败'
            }
        })
    }
}

//此处使用res.sendFile传送文件，但是实际开发过程中不会使用此方法
//因为它必须针对每次文件请求读取文件系统，所以会产生严重的延迟，影响应用程序的总体性能
//使用逆向代理Nginx，逆向代理位于 Web 应用程序之前，除了将请求转发给应用程序外，还对请求执行支持性操作。
//它还可以处理错误页、压缩、高速缓存、文件服务和负载均衡等功能。
exports.getAvatar = function(req, res) {
    //获取所需图片的名称
    var avatarName = req.params.avatarName

    //将路径中的‘/’修改为‘\’
    var rootPath = config.upload.path.replace(/\//g, '\\')

    //此处可根据需要进行修改，设置根路径之类的参数
    var options = {
        root: rootPath,
        dotfile: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    }

    //根据路径，传送头像文件给前台
    //获取图片，考虑是否先读取出图片，存为二进制或者什么形式，传给前台
    res.sendFile(avatarName, options, function(err) {
        if (err) {
            return res.json({
                status: {
                    code: 400,
                    message: '传输图片失败'
                }
            })
        } else {
            console.log('请求的头像' + avatarName + '传输成功')
        }
    })

}