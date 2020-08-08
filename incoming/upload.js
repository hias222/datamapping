const IncomingForm = require('formidable').IncomingForm

require('dotenv').config();

util = require('util');

module.exports = function upload(req, res) {
    //console.log(req);
    var form = new IncomingForm()
    
    form.parse(req);

    process.env.DEST_MQTT_TOPIC

    form.on('fileBegin', function (name, file){
        file.path = process.env.LENEX_BASE_DIR + '/' + file.name;
        //file.path = __dirname + '/../uploads/' + file.name;
    });

    form.on('file', function (name, file){
        console.log('<upload.js> Uploaded ' + file.name);
    });

}