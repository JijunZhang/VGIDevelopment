var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jwt-simple');

var TOKENSECRET = 'isie.sgg.whu.edu.cn'

var Schema = mongoose.Schema;

//  定义Token数据模式
var TokenSchema = new Schema({
    token: {
        type: String
    },
    date_created: { 
        type: Date, 
        default: Date.now 
    }
});

//  设置Token静态方法过期时间
Token.statics.hasExpired = function(created) {
    var now = new Date();
    var diff = (now.getTime() - created);
    return diff > config.ttl;
};

//  注册Token数据模型
var TokenModel = mongoose.model('Token', TokenSchema);

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
        type: String,
    },
    email: {
        //  邮箱
        type: String,
        index: true,
        match: [/.+\@.+\..+/, "Please fill a valid email address"]
    },
    passward: {
        //  密码
        type: String,
        // 设置密码规则
        validate: [
            function(password) {
                return password && password.length > 6;
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
    //  Token令牌
    token: { type: Object },
    reset_token: { type: String },
    reset_token_expires_millis: { type: Number },

    //  用户核心信息
    firstName: String,
    lastName: String,
    age: {
        //  年龄
        type: Number 
    },    
    gender: { 
        //  性别
        type: Boolean 
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
    portrait: {
        //  头像
        type: Buffer
    },
    telephone: {
        //  电话号码
        type: String 
    },
});

UserSchema.plugin(passportLocalMongoose, { usernameField: 'email' });

//  定义用户模型的虚拟属性
UserSchema.virtual('fullName').get(function() {
    return this.firstName + " " + this.lastName;
}).set(function(fullName) {
    var splitName = fullName.split(' ');
    this.firstName = splitName[0] || '';
    this.lastName = splitName[1] || '';
})

// Use a pre-save middleware to hash the password
UserSchema.pre('save', function(next) {
    if (this.password) {
        this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
        this.password = this.hashPassword(this.password);
    }

    next();
});

// Create an instance method for hashing a password
UserSchema.methods.hashPassword = function(password) {
    return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
};

// Create an instance method for authenticating user
UserSchema.methods.authenticate = function(password) {
    return this.password === this.hashPassword(password);
};

//  定义用户模型的静态方法
//  用户Token值的编解码操作
UserSchema.statics.encode = function(data) {
    return jwt.encode(data, TOKENSECRET);
};
UserSchema.statics.decode = function(data) {
    return jwt.decode(data, TOKENSECRET);
};

// 查找用户
UserSchema.statics.findUser = function(email, token, cb) {
    var self = this;
    this.findOne({ email: email }, function(err, usr) {
        if (err || !usr) {
            cb(err, null);
        } else if (usr.token && usr.token.token && token === usr.token.token) {
            cb(false, { email: usr.email, token: usr.token, date_created: usr.date_created, fullName: usr.fullName });
        } else {
            cb(new Error('Token does not exist or does not match.'), null);
        }
    });
};

UserSchema.statics.findUserByEmailOnly = function(email, cb) {
    var self = this;
    this.findOne({ email: email }, function(err, usr) {
        if (err || !usr) {
            cb(err, null);
        } else {
            cb(false, usr);
        }
    });
};

UserSchema.statics.createUserToken = function(email, cb) {
    var self = this;
    this.findOne({ email: email }, function(err, usr) {
        if (err || !usr) {
            console.log('err');
        }
        //Create a token and add to user and save
        var token = self.encode({ email: email });
        usr.token = new TokenModel({ token: token });
        usr.save(function(err, usr) {
            if (err) {
                cb(err, null);
            } else {
                console.log("about to cb with usr.token.token: " + usr.token.token);
                cb(false, usr.token.token); //token object, in turn, has a token property :)
            }
        });
    });
};

// Find possible not used username
UserSchema.statics.findUniqueUsername = function(username, suffix, callback) {
    var _this = this;

    // Add a 'username' suffix
    var possibleUsername = username + (suffix || '');

    // Use the 'User' model 'findOne' method to find an available unique username
    _this.findOne({
        username: possibleUsername
    }, function(err, user) {
        // If an error occurs call the callback with a null value, otherwise find find an available unique username
        if (!err) {
            // If an available unique username was found call the callback method, otherwise call the 'findUniqueUsername' method again with a new suffix
            if (!user) {
                callback(possibleUsername);
            } else {
                return _this.findUniqueUsername(username, (suffix || 0) + 1, callback);
            }
        } else {
            callback(null);
        }
    });
};

// Configure the 'UserSchema' to use getters and virtuals when transforming to JSON
UserSchema.set('toJSON', {
    getters: true,
    virtuals: true
});

//  注册User数据模型
mongoose.model('User', UserSchema);