var mongoose = require('mongoose');

var ComicSchema = new mongoose.Schema({
    title: {type: String, unique: true},
    url: String,
    likes: {type: Number, default: 0}
});

mongoose.model('Comic', ComicSchema);