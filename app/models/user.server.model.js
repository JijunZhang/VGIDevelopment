var mongoose = require('mongoose'),
    crypto = require('crypto'),
    Schema = mongoose.Schema;

var UserSchema = new Schema({
    firstName: String,
    lastName: String,
    email: {
        type: String,
        index: true,
        match: [/.+\@.+\..+/, "Please fill a valid email address"]
    },
    username: {
        type: String,
        unique: true,
        required: 'Username is required',
        trim: true        
    },
    passward:  {
		type: String,
		// Validate the 'password' value length
		validate: [
			function(password) {
				return password && password.length > 6;
			}, 'Password should be longer'
		]
	},
    salt: {
		type: String
	},
    created: {
        type: Date,
        default: Date.now
    },
    provider: {
		type: String,
		// Validate 'provider' value existance
		required: 'Provider is required'
	},
    providerId: String,
	providerData: {},
    website: {
        type: String,
        set: function(url) {
            if (!url) {
                return url;
            } else {
                if (url.indexOf('http://') !== 0 && url.indexOf('https://') !== 0) {
                    url = 'http://' + url;
                }
                return url;
            }
        },
        get: function(url) {
            if (!url) {
                return url;
            } else {
                if (url.indexOf('http://') !== 0 && url.indexOf('https://') !== 0) {
                    url = 'http://' + url;
                }
                return url;
            }
        }
    }
});

UserSchema.set('toJSON', {getters: true});

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

// Create the 'User' model out of the 'UserSchema'
mongoose.model('User', UserSchema);