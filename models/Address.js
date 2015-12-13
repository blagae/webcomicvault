var mongo_ip = function() {
    var address = process.env.MONGO_PORT_27017_TCP_ADDR;
    if (address) {
        return address;
    }
    return "127.0.0.1";
};

var mongo = function() {
    return 'mongodb://' + mongo_ip() + '/comics';
}

module.exports = {
    mongo: mongo
};