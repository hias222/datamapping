const mqtt = require('mqtt');
const mqttConfig = require("./connect/mqttSettings");
const connectFactory = require("./connect/connectFactory");

require('dotenv').config()

var sendsuccess = false;

class MqttSender {
  constructor() {
    this.mqttClient = null;
    this.debug = process.env.MQTT_SENDER_DEBUG === 'true' ? true : false;
  }

  connect() {

    this.mqttClient = connectFactory.createConnect("Mqtt", mqttConfig.mqttDestination, mqttConfig.mqttSettings);

    // Mqtt error calback
    this.mqttClient.on('error', (err) => {
      console.log('<sender> error');
      console.log(err);
      sendsuccess = false;
      this.mqttClient.end();
    });

    // Connection callback
    this.mqttClient.on('connect', () => {
      console.log(`<sender> mqtt_sender client connected`);
      sendsuccess = true;
    });

    this.mqttClient.on('close', (info) => {
      console.log(`<sender> mqtt_sender client disconnected`);
      console.log(info)
      sendsuccess = false;
    });

    this.mqttClient.on('disconnect', (info) => {
      console.log(`<sender> mqtt_sender disconnected`);
      console.log(info)
      sendsuccess = false;
    });

  }

  // Sends a mqtt message to topic: mytopic
  sendMessage(message) {
    this.mqttClient.publish(this.mqtttopic, message, function (err) {
      if (err) {
        console.log(err)
      }
    })
    if (this.debug) console.log('<sender ' + this.senderMode + ' > ' + message);
    return sendsuccess
  }
}

module.exports = MqttSender;
