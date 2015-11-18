var mongoose = require('mongoose');

var ComicSchema = new mongoose.Schema({
  title: String,
  url: String,
  likes: { type: Number, default: 0 }
});

mongoose.model('Comic', ComicSchema);