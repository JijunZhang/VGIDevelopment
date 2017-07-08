var mongoose = require('mongoose')
var crypto = require('crypto')
var jwt = require('jwt-simple')
var passportLocalMongoose = require('passport-local-mongoose')

var config = require('../../config/config')

var TOKENSECRET = 'isie.sgg.whu.edu.cn'

var Schema = mongoose.Schema

//  定义User数据模式
var UserSchema = new Schema({
    //  用户基本信息

    username: {
        //  用户名
        type: String,
        unique: true,
        required: 'Username is required',
        trim: true
    },
    nickname: {
        //  昵称
        type: String
    },
    email: {
        //  邮箱
        type: String,
        index: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address']
    },
    password: {
        //  密码
        type: String,
        // 设置密码规则
        validate: [
            function(password) {
                return password && password.length > 6
            }, 'Password should be longer'
        ]
    },
    salt: {
        type: String
    },
    date_created: {
        //  账户创建日期
        type: Date,
        default: Date.now
    },
    loginStatus: {
        type: Number,
        default: 0
    },
    //用于保存用于所做的地图标记的索引
    //一个 user--has many-->mapLabel，使用数组
    user_mapLabel: [{
        type: Schema.Types.ObjectId,
        ref: 'MapLabel'
    }],
    //用于保存用户创建任务的索引,用户可创建多个任务
    tasks: [{
        type: Schema.Types.ObjectId,
        ref: 'Task'
    }],
    //用于保存用户做了哪些任务的索引，用户可做多个任务
    user_task: [{
        type: Schema.Types.ObjectId,
        ref: 'Task'
    }],

    //  Token令牌
    token: { type: String },
    reset_token: { type: String },
    reset_token_expires_millis: { type: Date },

    //  用户核心信息

    //用户的真实姓名
    name: {
        type: String
    },
    age: {
        //  年龄
        type: Number
    },
    gender: {
        //  性别
        type: String
    },
    location: {
        //  位置
        type: String
    },
    occupation: {
        //  职业
        type: String
    },
    speciality: {
        //  特长
        type: String
    },
    avatar: {
        //  头像
        type: String
    },
    telephone: {
        //  电话号码
        type: String
    }
})

UserSchema.plugin(passportLocalMongoose)

//  定义用户模型的虚拟属性
// 此法暂时无用
// UserSchema.virtual('fullName').get(function() {
//     return this.firstName + ' ' + this.lastName
// }).set(function(fullName) {
//     var splitName = fullName.split(' ')
//     this.firstName = splitName[0] || ''
//     this.lastName = splitName[1] || ''
// })

//  定义用户模型的静态方法
//  用户Token值的编解码操作
UserSchema.statics.encode = function(data) {
    return jwt.encode(data, TOKENSECRET)
}
UserSchema.statics.decode = function(data) {
    return jwt.decode(data, TOKENSECRET)
}
UserSchema.statics.hasExpired = function(created) {
    var now = new Date()
    var diff = (now.getTime() - created)
    return diff > config.ttl
}

// 查找用户
UserSchema.statics.findUser = function(username, token, cb) {
    var self = this
    this.findOne({ username: username }, function(err, usr) {
        //console.log('id test:' + usr['_id'])
        if (err || !usr) {
            cb(err, null)
        } else if (usr.token && (token === usr.token)) {
            cb(false, usr)
        } else {
            cb(new Error('Token does not exist or does not match.'), null)
        }
    })
}

UserSchema.statics.findUserByUsernameOnly = function(username, cb) {
    var self = this
    this.findOne({ username: username }, function(err, usr) {
        if (err || !usr) {
            cb(err, null)
        } else {
            cb(false, usr)
        }
    })
}

UserSchema.statics.findUserByEmailOnly = function(email, cb) {
    var self = this
    this.findOne({ email: email }, function(err, usr) {
        if (err || !usr) {
            cb(err, null)
        } else {
            cb(false, usr)
        }
    })
}

UserSchema.statics.findUserByResetTokenOnly = function(reset_token, cb) {
    var self = this
    this.findOne({ reset_token: reset_token }, function(err, usr) {
        if (err || !usr) {
            cb(err, null)
        } else {
            cb(false, usr)
        }
    })
}

//  利用用户信息与生成时间创建用户令牌静态方法
UserSchema.statics.createUserToken = function(username, cb) {
    var self = this
    this.findOne({ username: username }, function(err, usr) {
        if (err || !usr) {
            console.log('err')
        }
        // 利用用户名和生成时间创建一个令牌并且添加并保存到该文档中
        var token = self.encode({
                username: username,
                date_created: Date.now()
            })
            // usr.token = new TokenModel({ token: token });
        usr.token = token
        usr.loginStatus = 1
        usr.save(function(err, usr) {
            if (err) {
                cb(err, null)
            } else {
                //console.log('about to cb with usr.token: ' + usr.token)
                cb(false, usr.token) // token object, in turn, has a token property :)
            }
        })
    })
}

//销毁token中和登录状态
UserSchema.statics.invalidateUserToken = function(username, cb) {
    var _this = this
    _this.findOne({ username: username }, function(err, usr) {
        if (err || !usr) {
            console.log('err')
        }
        usr.token = null
        usr.loginStatus = 0
        usr.save(function(err, usr) {
            if (err) {
                cb(err, null)
            } else {
                cb(false, 'removed')
            }
        })
    })
}

//reset_token过期时，用于销毁reset_token与reset_token_expires_millis
UserSchema.statics.invalidateResetToken = function(resetToken, cb) {
    var _this = this
    _this.findOne({ reset_token: resetToken }, function(err, usr) {
        if (err || !usr) {
            cb(err, null)
        } else {
            usr.reset_token = null
            usr.reset_token_expires_millis = null
            usr.save()
            cb(false, usr)
        }
    })
}

// 此法暂时无用，想法是用于销毁生成的reset_Token，
// 此字段用于保存忘记密码时生成的信息
UserSchema.statics.invalidateUserResetToken = function(username, cb) {
    var self = this
    this.findOne({ username: username }, function(err, usr) {
        if (err || !usr) {
            console.log('err')
        }
        usr.token = null
        usr.loginStatus = 0
        usr.save(function(err, usr) {
            if (err) {
                cb(err, null)
            } else {
                cb(false, 'removed')
            }
        })
    })
}

//  生成重置令牌的静态方法
UserSchema.statics.generateResetToken = function(username, cb) {
    console.log('in generateResetToken....')
    this.findUserByUsernameOnly(username, function(err, user) {
        if (err) {
            cb(err, null)
        } else if (user) {
            // Generate reset token and URL link; also, create expiry for reset token
            user.reset_token = require('crypto').randomBytes(32).toString('hex')
            var now = new Date()
            var expires = new Date(now.getTime() + (config.resetTokenExpiresMinutes * 60 * 1000)).getTime()
            user.reset_token_expires_millis = expires
            user.save()
            cb(false, user)
        } else {
            // TODO: This is not really robust and we should probably return an error code or something here
            cb(new Error('No user with that username found.'), null)
        }
    })
}

// Find possible not used username
UserSchema.statics.findUniqueUsername = function(username, suffix, callback) {
    var _this = this

    // Add a 'username' suffix
    var possibleUsername = username + (suffix || '')

    // Use the 'User' model 'findOne' method to find an available unique username
    _this.findOne({
        username: possibleUsername
    }, function(err, user) {
        // If an error occurs call the callback with a null value, otherwise find find an available unique username
        if (!err) {
            // If an available unique username was found call the callback method, otherwise call the 'findUniqueUsername' method again with a new suffix
            if (!user) {
                callback(possibleUsername)
            } else {
                return _this.findUniqueUsername(username, (suffix || 0) + 1, callback)
            }
        } else {
            callback(null)
        }
    })
}

// Configure the 'UserSchema' to use getters and virtuals when transforming to JSON
UserSchema.set('toJSON', {
    getters: true,
    virtuals: true
})

//  注册User数据模型
module.exports = mongoose.model('User', UserSchema)