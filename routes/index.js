var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;

var mongoose = require('mongoose');
var Comics = mongoose.model('Comics');

router.get('/comics', function(req, res, next) {
	Comics.find(function(err, comics) {
		if(err){ return next(err);}
		res.json(comics);
	});
});