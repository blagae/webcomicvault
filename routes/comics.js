var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
// TODO: make env variable
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

var mongoose = require('mongoose');
var Comic = mongoose.model('Comic');
var Strip = mongoose.model('Strip');
var User = mongoose.model('User');
var Category = mongoose.model('Category');

router.param('comic', function (req, res, next, id) {
    var query = Comic.findOne({'title': id});

    query.exec(function (err, comic) {
        if (err) {
            return next(err);
        }
        if (!comic) {
            return next(new Error('can\'t find comic'));
        }

        req.comic = comic;
        return next();
    });
});

router.get('/:comic', function (req, res, next) {
    res.json(req.comic);
});

router.get('/:comic/strips', function (req, res, next) {
    Strip.find({'comic': req.comic._id}, function (err, strips) {
        if (err) {
            return next(err);
        }
        res.json(strips);
    });
});

router.get('/:comic/categories', function (req, res, next) {
    Category.find({'_id': {$in: req.comic.categories}}, function (err, categories) {
        if (err) {
            return next(err);
        }
        res.json(categories);
    });
});


router.get('/:comic/users', function (req, res, next) {
    User.find({'_id': {$in: req.comic.users}}, function (err, users) {
        if (err) {
            return next(err);
        }
        res.json(users);
    });
});

router.get('/', function (req, res, next) {
    Comic.find().sort({likes: 'descending'}).find(function (err, comics) {
        if (err) {
            return next(err);
        }
        res.json(comics);
    });
});


router.post('/', auth, function (req, res, next) {
    var comic = new Comic(req.body);
    comic.save(function (err, comic) {
        if (err) {
            return next(err);
        }

        res.json(comic);
    });
});

module.exports = router;