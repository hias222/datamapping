require('dotenv').config()

var mqttpath = '/wsmqtt'

var mqttmode = typeof process.env.DEST_MQTT_MODE !== "undefined" ? process.env.DEST_MQTT_MODE : 'MQTT';

var mqtttopic = typeof process.env.DEST_MQTT_TOPIC !== "undefined" ? process.env.DEST_MQTT_TOPIC : 'mainchannel';
var authenticationWS = process.env.DST_USE_WS === 'true' ? true : false;
var authenticationPWD = typeof process.env.DEST_MQTT_PWD !== "undefined" ? true : false;

var debug = process.env.MQTT_SENDER_DEBUG === 'true' ? true : false;

var clientId = 'senderjs_' + Math.random().toString(16).substr(2, 8)
var mqtt_username_dst = process.env.DEST_MQTT_USER;
var mqtt_password_dst = process.env.DEST_MQTT_PWD;


if (authenticationPWD) {
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

if (mqttmode === 'AZURE') {

    var username = process.env.DEST_MQTT_HOST + "/" + process.env.DEST_MQTT_DEVICEID + "/?api-version=2018-06-30"
    var azurehost = "mqtts://" + process.env.DEST_MQTT_HOST + ":8883"
    var deviceid = process.env.DEST_MQTT_DEVICEID;
    var password = process.env.DEST_MQTT_PWD;

    var azureSettings = {
        clientId: deviceid,
        username: username,
        password: password,
    }

    console.log("<sender> Azure connect  " + azurehost + " " + username + " " + this.deviceid);

    if (this.debug) console.log(settings)

    mqttSettings = { azureSettings }
    mqttDestination = azurehost

    //this.mqttClient = mqtt.connect(azurehost, {
    //    settings
    //});

} else if (authenticationWS) {

    var additional = {
        path: mqttpath,
    }

    var wsmqttport = typeof process.env.DEST_MQTT_PORT !== "undefined" ? process.env.DEST_MQTT_PORT : 9001
    var wshosthost = typeof process.env.DEST_MQTT_HOST !== "undefined" ? 'ws://' + process.env.DEST_MQTT_HOST + ':' + wsmqttport : 'ws://localhost:' + wsmqttport
    var wsSettings = { ...additional, ...authenication }

    mqttSettings = wsSettings
    mqttDestination = wshosthost

} else {

    var localSettings = { ...additional, ...authenication }
    var mqttport = typeof process.env.DEST_MQTT_PORT !== "undefined" ? process.env.DEST_MQTT_PORT : 1883
    var localDestination = typeof process.env.DEST_MQTT_HOST !== "undefined" ? 'mqtt://' + process.env.DEST_MQTT_HOST + ":" + mqttport : 'mqtt://localhost:' + mqttport;

    mqttSettings = localSettings
    mqttDestination = localDestination
}

console.log('<sender> ' + mqttmode + ' Destination ' + mqttDestination);
if (debug) console.log(mqttSettings)

module.exports = {
    mqttSettings,
    mqttDestination
}
