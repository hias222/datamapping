const mqtt = require('mqtt');
const mqttConfig = require("./connect/mqttSettings");
const connectFactory = require("./connect/connectFactory");
const storeData = require("./sendStoreData")

require('dotenv').config()

var sendsuccess = false;

class MqttSender {
  constructor() {
    this.mqttClient = null;
    this.debug = process.env.MQTT_SENDER_DEBUG === 'true' ? true : false;
    this.mqtttopic = typeof process.env.DEST_MQTT_TOPIC !== "undefined" ? process.env.DEST_MQTT_TOPIC : 'mainchannel';
    this.storetopic = typeof process.env.DEST_STORE_TOPIC !== "undefined" ? process.env.DEST_STORE_TOPIC : 'storechannel';

    this.mqttmode = typeof process.env.DEST_MQTT_MODE !== "undefined" ? process.env.DEST_MQTT_MODE : 'MQTT';
  }

  connect() {

    this.mqttClient = connectFactory.createConnect(this.mqttmode, mqttConfig.mqttDestination, mqttConfig.mqttSettings);

    // AWS offline checks
    this.mqttClient.subscribe(this.mqtttopic)
    this.mqttClient.subscribe(this.storetopic)
    // Mqtt error calback
    this.mqttClient.on('error', (err) => {
      console.log('<sender> error');
      console.log(err);
      sendsuccess = false;
      this.mqttClient.end();
    });

    // Connection callback
    this.mqttClient.on('connect', () => {
      console.log(`<sender> mqtt_sender client (connect) connected`);
      sendsuccess = true;
    });

    this.mqttClient.on('close', (info) => {
      console.log(`<sender> mqtt_sender client (close) disconnected`);
      if (this.mqttmode === 'AWS') console.log('<sender> AWS: maybe missing grants to topic')
      console.log(info)
      sendsuccess = false;
      // senedn gehtv sonst nicht mehr, nach einem connect abbruch
      // evtuell mac problem
      process.exit(1)
    });

    this.mqttClient.on('disconnect', (info) => {
      console.log(`<sender> mqtt_sender disconnected`);
      console.log(info)
      sendsuccess = false;
    });

  }

  // Sends a mqtt message to topic: mytopic
  sendMessage(message) {
    //send to MQTT
    var _debug = this.debug
    var _mqttmode = this.mqttmode
    this.mqttClient.publish(this.mqtttopic, message, function (err) {
      if (_debug) console.log('<sender> ' + _mqttmode + ' send ');
      if (err) {
        console.log('<mqtt_sende> ' + publish)
        console.log(err)
      }
    })
    //send for store
    storeData.storeBaseData(message, this.mqttClient)
    if (this.debug) console.log('<sender> ' + this.mqttmode + ' store ' + message);
    return sendsuccess
  }
}

module.exports = MqttSender;
