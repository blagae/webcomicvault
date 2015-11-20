var mongoose = require('mongoose');

var StripSchema = new mongoose.Schema({
    title: String,
    url: String,
    sequence: Number,
    alt: String,
    comic: {type: mongoose.Schema.Types.ObjectId, ref: 'Comic'},
    likes: {type: Number, default: 0}
});

mongoose.model('Strip', StripSchema);