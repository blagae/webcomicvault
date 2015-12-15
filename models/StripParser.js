var request = require('request');
var cheerio = require('cheerio');
var mongoose = require('mongoose');
var Comic = mongoose.model('Comic');
var Strip = mongoose.model('Strip');

var replace = function (str, col) {
    col = typeof col === 'object' ? col : Array.prototype.slice.call(arguments, 1);

    return str.replace(/\{\{|\}\}|\{(\w+)\}/g, function (m, n) {
        if (m == "{{") { return "{"; }
        if (m == "}}") { return "}"; }
        return col[n];
    });
};

var parse = function(com) {
    Comic.findOne({'title': com})
    .exec(function (err, comic) {
        var item = 1;
        while(true) {
            var url = comic.url + replace(comic.urlpattern, item++);
            if (item > 10) {
                console.log("aborting");
                return;
            }
            request(url, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var $ = cheerio.load(body);
                    var img = $(comic.imgpattern);
                    img = img[0].attribs;
                    var s = new Strip();
                    s.url = img.src;
                    s.alt = img.title;
                    s.comic = comic;
                    s.save(); 
                }
            });
        }
    });
};

module.exports = {
    parse: parse
};