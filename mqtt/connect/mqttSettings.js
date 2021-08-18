require('dotenv').config()

var mqtttopic = typeof process.env.DEST_MQTT_TOPIC !== "undefined" ? process.env.DEST_MQTT_TOPIC : 'mainchannel';
var senderMode = 'local'
var authenticationAzure = typeof process.env.DEST_MQTT_DEVICEID !== "undefined" ? true : false;
var authenticationWS = process.env.DST_USE_WS === 'true' ? true : false;
var authenticationPWD = typeof process.env.DEST_MQTT_PWD !== "undefined" ? true : false;

var debug = process.env.MQTT_SENDER_DEBUG === 'true' ? true : false;

var clientId = 'senderjs_' + Math.random().toString(16).substr(2, 8)
var mqtt_username_dst = process.env.DEST_MQTT_USER;
var mqtt_password_dst = process.env.DEST_MQTT_PWD;

var mqttport = typeof process.env.DEST_MQTT_PORT !== "undefined" ? process.env.DEST_MQTT_PORT : 1883
var mqttdestination = typeof process.env.DEST_MQTT_HOST !== "undefined" ? 'mqtt://' + process.env.DEST_MQTT_HOST + ":" + mqttport : 'mqtt://localhost:' + mqttport;

if (this.authenticationPWD) {
    var authenication = {
        clientId: clientId,
        username: mqtt_username_dst,
        password: mqtt_password_dst,
    }
} else {
    var authenication = {
        clientId: clientId,
    }
}

var additional = {
    keepalive: 2000
}

var mqttSettings = { ...additional, ...authenication }
var mqttDestination = typeof process.env.DEST_MQTT_HOST !== "undefined" ? 'mqtt://' + process.env.DEST_MQTT_HOST + ":" + mqttport : 'mqtt://localhost:' + mqttport;


if (debug) console.log(mqttdestination);
if (debug) console.log(additional)
if (debug) console.log(authenication)

module.exports = {
    mqttSettings ,
    mqttDestination
}
