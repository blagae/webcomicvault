var evilscan = require('evilscan');
// for docker container

var scan = function(trgt, prt) {
    var result = "127.0.0.1";
    var options = {
        target:trgt,
        port:prt,
        //status:'TROU', // Timeout, Refused, Open, Unreachable
        banner:true
    };
    var scanner = new evilscan(options);

    scanner.on('result',function(data) {
        result = data.ip;
    });

    setTimeout(function() {
        scanner.run();
    }, 2000); // https://github.com/eviltik/evilscan/issues/37

    console.log("connecting to IP address: " + result);
    return result;
};

module.exports = {
    scan: scan
};