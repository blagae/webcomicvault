var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var crypto = require('crypto');
var _ = require("underscore");
var fs = require("fs");
var Grid = require("gridfs-stream");
var request = require("request");

var autoIncrement = require('mongoose-auto-increment');
var address = require('./Address');
var connection = mongoose.createConnection(address.mongo());

autoIncrement.initialize(connection);

Grid.mongo = mongoose.mongo;
var gfs = Grid(connection.db);

var CategorySchema = new mongoose.Schema({
    name: {type: String, unique: true},
    description: String,
    comics: [{type: Number, ref: 'Comic'}]
});

mongoose.model('Category', CategorySchema);

var ComicSchema = new mongoose.Schema({
    title: {type: String, unique: true},
    author: [String],
    description: String,
    tagline: String,
    since: Number,
    url: String,
    urlpattern: String,
    imgpattern: String,
    current: mongoose.Schema.Types.Mixed,
    users: [{type: Number, ref: 'User'}],
    categories: [{type: Number, ref: 'Category'}],
    likes: {type: Number, default: 0},
    strips: [{type: Number, ref: 'Strip'}]
});

mongoose.model('Comic', ComicSchema);

var states = 'like typical best'.split(' ');

var UserSchema = new mongoose.Schema({
    username: {type: String, lowercase: true, unique: true},
    hash: String,
    salt: String,
    comics: [{type: Number, ref: 'Comic'}],
    settings: mongoose.Schema.Types.Mixed,
    strips: [{strip: {type: Number, ref: 'Strip'}, liketype: [{type: String, enum: states, default: 'like'}]}]
});



var StripSchema = new mongoose.Schema({
    url: [String],
    sequence: Number,
    title: String,
    comic: {type: Number, ref: 'Comic'},
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

CategorySchema.plugin(autoIncrement.plugin, {
    model: 'Category',
    startAt: 20000001});
StripSchema.plugin(autoIncrement.plugin, {
    model: 'Strip',
    startAt: 40000001});
UserSchema.plugin(autoIncrement.plugin, {
    model: 'User',
    startAt: 30000001});
ComicSchema.plugin(autoIncrement.plugin, {
    model: 'Comic',
    startAt: 10000001});

var User = mongoose.model('User');
var Comic = mongoose.model('Comic');
var Category = mongoose.model('Category');
var Strip = mongoose.model('Strip');

ComicSchema.pre('save', function (next) {
    this.users = _.unique(this.users);
    this.categories = _.unique(this.categories);
    this.strips = _.unique(this.strips);
    next();
});
UserSchema.pre('save', function (next) {
    this.comics = _.unique(this.comics);
    this.strips = _.unique(this.strips);
    next();
});

CategorySchema.pre('save', function (next) {
    this.comics = _.unique(this.comics);
    next();
});

// hook taken from https://stackoverflow.com/questions/16882938/how-to-check-if-that-data-already-exist-in-the-database-during-update-mongoose
StripSchema.pre('save', function (next) {
    var self = this;
    Strip.find({comic : self.comic, sequence: self.sequence}, function (err, docs) {
        if (!docs.length){
            next();
        }else{                
            console.log('strip exists: ', self.comic.title + '/' + self.sequence);
            next(new Error("Strip already exists!"));
        }
    });
}) ;

ComicSchema.post('save', function () {
    var id = this._id;
    this.users.forEach(function (userid) {
        User.findOne({'_id': userid}).exec(function (err, user) {
            if (!err && user && user.comics && !_.contains(user.comics, id)) {
                user.comics.push({'_id': id});
                user.save();
            }
        });
    });
    this.categories.forEach(function (catid) {
        Category.findOne({'_id': catid}).exec(function(err, cat) {
            if (!err && cat && cat.comics && !_.contains(cat.comics, id)) {
                cat.comics.push({'_id': id});
                cat.save();
            }
        });
    });
    this.strips.forEach(function (stripid) {
        Strip.findOne({'_id': stripid}).exec(function(err, strip) {
            if (!err && strip && strip.comics && !_.contains(strip.comics, id)) {
                strip.comics.push({'_id': id});
                strip.save();
            }
        });
    });
});

UserSchema.post('save', function () {
    var inst = this._id;
    this.comics.forEach(function (comicid) {
        Comic.findOne({'_id': comicid}).exec(function (err, comic) {
            if (!err && comic && comic.users && !_.contains(comic.users, inst)) {
                comic.users.push({'_id': inst});
                comic.save();
            }
        });
    });
    this.strips.forEach(function (stripid) {
        Strip.findOne({'_id': stripid}).exec(function (err, strip) {
            if (!err && strip && strip.users && !_.contains(strip.users, inst)) {
                strip.users.push({'_id': inst});
                strip.save();
            }
        });
    });
});


CategorySchema.post('save', function () {
    var inst = this._id;
    this.comics.forEach(function (comicid) {
        Comic.findOne({'_id': comicid}).exec(function (err, comic) {
            if (!err && comic && comic.users && !_.contains(comic.users, inst)) {
                comic.categories.push({'_id': inst});
                comic.save();
            }
        });
    });
});

StripSchema.post('save', function () {
    var inst = this._id;
    if (this.comic) {
        var c = this.comic;
        Comic.findOne({'_id': c}).exec(function (err, comic) {
            if (!err && comic && comic.strips && !_.contains(comic.strips, inst)) {
                comic.strips.push({'_id': inst});
                comic.save();
            }
        });
    }
    
    if (this.url) {
        request(this.url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                
                var writestream = gfs.createWriteStream({
                    filename: this.sequence
                });
                fs.createReadStream(body).pipe(writestream);
            }
        });
    }
});