const mqtt = require('mqtt');
const mqttConfig = require("./connect/mqttSettings");
const connectFactory = require("./connect/connectFactory");
const storeData = require("./sendStoreData")
const mqtt5 = require("aws-iot-device-sdk-v2").mqtt5;

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
    console.log("==== mqttClient ====\n");

    // Event handler for lifecycle event Stopped
    this.mqttClient.on('stopped', () => {
      console.log("Lifecycle Stopped\n");
    });

    // Event handler for lifecycle event Attempting Connect
    this.mqttClient.on('attemptingConnect', () => {
      console.log('<sender> Lifecycle Connection Attempt\n');
    });

    // Event handler for lifecycle event Connection Success
    this.mqttClient.on('connectionSuccess', (eventData) => {
      console.log(`Lifecycle Connection Success with reason code: ${eventData.connack.reasonCode}\n`);
    });

    // Event handler for lifecycle event Connection Failure
    this.mqttClient.on('connectionFailure', (eventData) => {
      console.log(`Lifecycle Connection Failure with exception: ${eventData.error}`);
    });

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

    console.log("==== Starting client ====");
    this.mqttClient.start();
  }

  // Sends a mqtt message to topic: mytopic
  sendMessage(message) {
    //send to MQTT
    var _debug = this.debug
    var _mqttmode = this.mqttmode
    if (_debug) console.log('<sender> try publish ' + _mqttmode + ' message: ' + message);

    this.mqttClient.publish({
      topicName: this.mqtttopic,
      payload: message,
      qos: mqtt5.QoS.AtLeastOnce
    }, function (err) {
      if (_debug) console.log('<sender> ' + _mqttmode + ' send to' + this.mqtttopic);
      if (err) {
        console.log('<mqtt_sender> ' + this.mqtttopic + ' publish error')
        console.log(err)
      }
    })


    //this.mqttClient.publish(this.mqtttopic, message, function (err) {
    //  if (_debug) console.log('<sender> ' + _mqttmode + ' send ');
    //  if (err) {
    //    console.log('<mqtt_sende> ' + publish)
    //    console.log(err)
    //  }
    //})
    //send for store
    storeData.storeBaseData(message, this.mqttClient)
    if (this.debug) console.log('<sender> ' + this.mqttmode + ' store ' + message);
    return sendsuccess
  }
}

module.exports = MqttSender;
