var mongoose = require('mongoose');

var CategorySchema = new mongoose.Schema({
    name: {type: String, unique: true},
    description: String,
    comics: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comic'}]
});

mongoose.model('Category', CategorySchema);