
module.exports = function configuration(req, res) {
    //console.log(req);
    var stringJson = "{ \"health\": \"up\" }"

    res.send(JSON.parse(stringJson));
}