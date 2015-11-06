var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
// TODO: make env variable
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

var mongoose = require('mongoose');
var Comics = mongoose.model('Comics');

router.get('/comics', function(req, res, next) {
	Comics.find(function(err, comics) {
		if(err){ return next(err);}
		res.json(comics);
	});
});

router.post('/comics', auth, function(req, res, next) {
	var comic = new Comics(req.body);
	comic.save(function(err, comic){
		if(err){ return next(err); }

		res.json(comic);
	});
});

module.exports = router;