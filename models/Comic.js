var mongoose = require('mongoose');

var ComicSchema = new mongoose.Schema({
  title: String,
  url: String
});

mongoose.model('Comic', ComicSchema);