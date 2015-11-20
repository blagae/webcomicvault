var mongoose = require('mongoose');

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

var User = mongoose.model('User');

ComicSchema.pre('save', function (next) {
    this.likes = this.users.length;
    next();
});

ComicSchema.post('save', function () {
    var id = this._id;
    this.users.forEach(function (userid) {
        User.findOne({'_id': userid}).exec(function (err, user) {
            if (!err) {
                user.comics.push({'_id': id});
                user.save();
            }
        });
    });
});

mongoose.model('Comic', ComicSchema);