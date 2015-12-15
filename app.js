var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var mongoose = require('mongoose');
var passport = require('passport');
require('./models/Models');
require('./config/passport');
var path = require('path');
var msf = require('mongoose-simple-fixtures');
var dir = path.resolve(__dirname, "./models/fixtures");

msf(dir, function (err, results) {
    if (err)
        console.log("loading data failed" + err);
});
var address = require('./models/Address');

mongoose.connect(address.mongo());


var routes = require('./routes/index');
var user = require('./routes/user');
var comics = require('./routes/comics');
var categories = require('./routes/categories');
var strips = require('./routes/strips');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public/images', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use('/', routes);
app.use('/user', user);
app.use('/comics', comics);
app.use('/categories', categories);
app.use('/strips', strips);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var parser = require('./models/StripParser');
parser.parse('XKCD');

module.exports = app;
