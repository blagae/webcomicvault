var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
// TODO: make env variable
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

var mongoose = require('mongoose');
var Comic = mongoose.model('Comic');
var Category = mongoose.model('Category');

router.get('/', function (req, res, next) {
    Category.find(function (err, cats) {
        if (err) {
            return next(err);
        }
        res.json(cats);
    });
});

router.param('category', function (req, res, next, id) {
    var query = Category.findOne({'name': id});

    query.exec(function (err, category) {
        if (err) {
            return next(err);
        }
        if (!category) {
            return next(new Error('can\'t find category'));
        }

        req.category = category;
        return next();
    });
});

router.get('/:category', function (req, res, next) {
    res.json(req.category);
});

router.get('/:category/comics', function (req, res, next) {
    Comic.find({'_id': {$in: req.category.comics}}, function (err, comics) {
        if (err) {
            return next(err);
        }
        res.json(comics);
    });
});
module.exports = router;