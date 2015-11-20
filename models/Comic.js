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
    strips: [{ strip: {type: mongoose.Schema.Types.ObjectId, ref: 'Strip'}}]
});

ComicSchema.pre('save', function(next) {
    this.likes = this.users.length;
    next();
});

mongoose.model('Comic', ComicSchema);