var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
// TODO: make env variable
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

var mongoose = require('mongoose');
var Comic = mongoose.model('Comic');
var Strip = mongoose.model('Strip');

router.param('comic', function(req, res, next, id) {
  var query = Comic.findOne({'title': id});

  query.exec(function (err, comic){
    if (err) { return next(err); }
    if (!comic) { return next(new Error('can\'t find comic')); }

    req.comic = comic;
    return next();
  });
});

router.get('/:comic', function(req, res, next) {
	Comic.findOne({'title': req.comic.title}, function(err, comic) {
		if(err){ return next(err);}
		res.json(comic);
	});
});

router.get('/:comic/strips', function(req, res, next) {
	Strip.find({'comic': req.comic._id}, function(err, strips) {
		if(err){ return next(err);}
		res.json(strips);
	});
});

router.get('/', function(req, res, next) {
	Comic.find().sort({likes: 'descending'}).find(function(err, comics) {
		if(err){ return next(err);}
		res.json(comics);
	});
});


router.post('/', auth, function(req, res, next) {
	var comic = new Comic(req.body);
	comic.save(function(err, comic){
		if(err){ return next(err); }

		res.json(comic);
	});
});

module.exports = router;