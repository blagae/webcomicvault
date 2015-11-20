var express = require('express');
var router = express.Router();
var passport = require('passport');
var jwt = require('express-jwt');
// TODO: make env variable
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

/* GET users listing. */
router.get('/', auth, function (req, res, next) {
    res.json(auth);
});

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Comic = mongoose.model('Comic');

router.param('user', function (req, res, next, id) {
    var query = User.findOne({'username': id});

    query.exec(function (err, user) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return next(new Error('can\'t find user'));
        }

        req.user = user;
        return next();
    });
});

router.get('/:user/comics', function (req, res, next) {
    Comic.find({'_id': {$in: req.user.comics}}, function (err, comics) {
        if (err) {
            return next(err);
        }
        res.json(comics);
    });
});

router.post('/register', function (req, res, next) {
    if (!req.body.username || !req.body.password) {
        return res.status(400).json({message: 'Please fill out all fields'});
    }

    var user = new User();

    user.username = req.body.username;

    user.setPassword(req.body.password)

    user.save(function (err) {
        if (err) {
            return next(err);
        }

        return res.json({token: user.generateJWT()})
    });
});

router.post('/login', function (req, res, next) {
    if (!req.body.username || !req.body.password) {
        return res.status(400).json({message: 'Please fill out all fields'});
    }

    passport.authenticate('local', function (err, user, info) {
        if (err) {
            return next(err);
        }

        if (user) {
            return res.json({token: user.generateJWT()});
        } else {
            return res.status(401).json(info);
        }
    })(req, res, next);
});

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

module.exports = router;