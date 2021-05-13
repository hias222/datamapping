const mqtt = require('mqtt');
require('dotenv').config()

var sendsuccess = false;
var mqttpath = '/wsmqtt'

class MqttSender {
  constructor() {
    this.mqttClient = null;
    this.mqtttopic = typeof process.env.DEST_MQTT_TOPIC !== "undefined" ? process.env.DEST_MQTT_TOPIC : 'mainchannel';

    this.authenticationAzure = typeof process.env.DEST_MQTT_DEVICEID !== "undefined" ? true : false;
    this.authenticationWS = process.env.DST_USE_WS === 'true' ? true : false;
    this.authenticationPWD = typeof process.env.DEST_MQTT_PWD !== "undefined" ? true : false;

    this.debug = process.env.MQTT_DEBUG === 'true' ? true : false; 
  }

  connect() {
    
    var clientId = 'senderjs_' + Math.random().toString(16).substr(2, 8)
    var mqtt_username_dst = process.env.DEST_MQTT_USER;
    var mqtt_password_dst = process.env.DEST_MQTT_PWD;

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

    if (this.authenticationAzure) {

      var username = process.env.DEST_MQTT_HOST + "/" + process.env.DEST_MQTT_DEVICEID + "/?api-version=2018-06-30"
      var azurehost = "mqtts://" + process.env.DEST_MQTT_HOST + ":8883"
      var deviceid = process.env.DEST_MQTT_DEVICEID;
      var password = process.env.DEST_MQTT_PWD;

      var settings = {
        clientId: deviceid,
        username: username,
        password: password,
      }

      console.log("<sender> Azure connect  " + azurehost + " " + username + " " + this.deviceid);

      if (this.debug) console.log(settings)

      this.mqttClient = mqtt.connect(azurehost, {
        settings
      });

    } else if (this.authenticationWS) {

      var wsmqttport = typeof process.env.DEST_MQTT_PORT !== "undefined" ? process.env.DEST_MQTT_PORT : 9001
      var wshosthost = typeof process.env.DEST_MQTT_HOST !== "undefined" ? 'ws://' + process.env.DEST_MQTT_HOST + ':' + wsmqttport : 'ws://localhost:' + wsmqttport

      var additional = {
        path: mqttpath,
      }

      var settings = { ...additional, ...authenication }

      console.log("<sender> ws connect " + wshosthost);
      console.log(additional)
      if (this.debug) console.log(authenication)
      this.mqttClient = mqtt.connect(wshosthost, settings);

    } else {

      var mqttport = typeof process.env.DEST_MQTT_PORT !== "undefined" ? process.env.DEST_MQTT_PORT : 1883
      var mqttdestination = typeof process.env.DEST_MQTT_HOST !== "undefined" ? 'mqtt://' + process.env.DEST_MQTT_HOST + ":" + mqttport : 'mqtt://localhost:' + mqttport;

      var additional = {
        keepalive: 2000
      }

      var settings = { ...additional, ...authenication }

      console.log("<sender> mqtt connect " + mqttdestination);
      if (this.debug) console.log(additional)
      if (this.debug) console.log(authenication)
      this.mqttClient = mqtt.connect(mqttdestination, settings);
    }


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
    return sendsuccess
  }
}

module.exports = MqttSender;
