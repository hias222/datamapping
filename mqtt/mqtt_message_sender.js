const mqtt = require('mqtt');

require('dotenv').config()

var sendsuccess = false;

var mqtt_username_local = typeof process.env.MQTT_USERNAME_LOCAL !== "undefined" ? process.env.MQTT_USERNAME_LOCAL : 'mqtt';
var mqtt_password_local = typeof process.env.MQTT_PASSWORD_LOCAL !== "undefined" ? process.env.MQTT_PASSWORD_LOCAL : 'mqtt';


var settings = {
    keepalive: 2000,
    username: mqtt_username_local,
    password: mqtt_password_local,
    };

class MqttMessageSender {
    constructor() {
        //this.mqttClient = null;
        this.rawtopic = 'info'
        //this.host = 'mqtt://localhost';
        this.mqttClient = mqtt.connect('mqtt://localhost', settings);
    }

    // Sends a mqtt message to topic: mytopic
    sendMessage(message) {
        console.log("<mqqt_message_sender>" + message)
        this.mqttClient.publish(this.rawtopic, message, function (err) {
            if (err) {
                console.log(err)
            }
            sendsuccess = true;
        })
        return sendsuccess
    }
}

module.exports = MqttMessageSender;
