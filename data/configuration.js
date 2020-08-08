const PropertyReader = require('properties-reader')

var propertyfile = __dirname + "/../" + process.env.PROPERTY_FILE;

module.exports = function configuration(req, res) {
    //console.log(req);
    var properties = PropertyReader(propertyfile)
    var event_type = properties.get("main.event_type")
    var lenex_startlist = properties.get("main.lenex_startlist")

    var stringJson = "{ \"event_type\": \"" + event_type + "\", \"lenex_startlist\": \"" + lenex_startlist + "\"}"

    res.send(JSON.parse(stringJson));
}