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

var parse = function() {
    Comic.find().exec(function(err, comics) {
        comics.forEach(function(comic) {
            if (comic.title === "Oglaf")
                return; // can't handle Oglaf just yet
            var item = 0;
            while(true) {
                var url = comic.url + replace(comic.urlpattern, ++item);
                if (item > 9) {
                    console.log("finished downloading "+ item + " items from " + comic.title);
                    return;
                }
                request({
                    method: 'GET',
                    uri: url,
                    number: item // add property to communicate sequence number
                }, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        var $ = cheerio.load(body);
                        var img = $(comic.imgpattern);
                        if (!img[0]) {
                            console.log("no image found for " + this.uri.href);
                            return;
                        }
                        img = img[0].attribs;
                        var s = new Strip();
                        if (img.src.indexOf("http") > -1 || img.src.indexOf("//") === 0)
                            s.url = img.src;
                        else if (img.src.charAt(0) === '.')
                            s.url = comic.url + img.src.substring(1);
                        else
                            s.url = comic.url + img.src;
                        s.title = img.title;
                        s.comic = comic;
                        s.sequence = this.number;
                        s.save(); 
                    }
                });
            }
        });
    });
};

module.exports = {
    parse: parse
};