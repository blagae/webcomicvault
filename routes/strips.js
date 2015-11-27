var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
// TODO: make env variable
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

var mongoose = require('mongoose');
var Comic = mongoose.model('Comic');
var Strip = mongoose.model('Strip');

router.get('/', function (req, res, next) {
    Strip.find(function (err, cats) {
        if (err) {
            return next(err);
        }
        res.json(cats);
    });
});

router.param('strip', function (req, res, next, id) {
    var query = Strip.findOne({'_id': id});

    query.exec(function (err, strip) {
        if (err) {
            return next(err);
        }
        if (!strip) {
            return next(new Error('can\'t find strip'));
        }

        req.strip = strip;
        return next();
    });
});

router.get('/:strip', function (req, res, next) {
    res.json(req.strip);
});

module.exports = router;