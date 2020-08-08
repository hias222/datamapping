const mqtt = require('mqtt');

require('dotenv').config()

var sendsuccess = false;

var settings = {
    keepalive: 2000
  }

class MqttMessageSender {
    constructor() {
        this.mqttClient = null;
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
