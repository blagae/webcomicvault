var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var crypto = require('crypto');

var CategorySchema = new mongoose.Schema({
    name: {type: String, unique: true},
    description: String,
    comics: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comic'}]
});

mongoose.model('Category', CategorySchema);

var ComicSchema = new mongoose.Schema({
    title: {type: String, unique: true},
    description: String,
    url: String,
    urlpattern: String,
    current: mongoose.Schema.Types.Mixed,
    users: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    categories: [{type: mongoose.Schema.Types.ObjectId, ref: 'Category'}],
    likes: {type: Number, default: 0},
    strips: [{strip: {type: mongoose.Schema.Types.ObjectId, ref: 'Strip'}}]
});

mongoose.model('Comic', ComicSchema);

var states = 'like typical best'.split(' ');

var UserSchema = new mongoose.Schema({
    username: {type: String, lowercase: true, unique: true},
    hash: String,
    salt: String,
    comics: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comic'}],
    settings: mongoose.Schema.Types.Mixed,
    strips: [{ strip: {type: mongoose.Schema.Types.ObjectId, ref: 'Strip'}, liketype: [{type: String, enum: states, default: 'like'}]}]
});



var StripSchema = new mongoose.Schema({
    title: String,
    url: String,
    sequence: Number,
    alt: String,
    comic: {type: mongoose.Schema.Types.ObjectId, ref: 'Comic'},
    likes: {type: Number, default: 0}
});

mongoose.model('Strip', StripSchema);

UserSchema.methods.setPassword = function (password) {
    this.salt = crypto.randomBytes(16).toString('hex');

    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

UserSchema.methods.validPassword = function (password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');

    return this.hash === hash;
};

UserSchema.methods.generateJWT = function () {
    var today = new Date();
    var exp = new Date(today);
    exp.setDate(today.getDate() + 14);

    return jwt.sign({
        _id: this._id,
        username: this.username,
        exp: parseInt(exp.getTime() / 1000)
    }, 'SECRET'); // TODO: set env variable
};
mongoose.model('User', UserSchema);


ComicSchema.pre('save', function (next) {
    this.likes = this.users.length;
    next();
});

var User = mongoose.model('User');
ComicSchema.post('save', function () {
    var id = this._id;
    this.users.forEach(function (userid) {
        User.findOne({'_id': userid}).exec(function (err, user) {
            if (!err && user) {
                user.comics.push({'_id': id});
                user.save();
            }
        });
    });
});
