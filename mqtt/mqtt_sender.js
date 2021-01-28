const mqtt = require('mqtt');
require('dotenv').config()

var sendsuccess = false;
var mqttpath = '/wsmqtt'

class MqttSender {
  constructor() {
    this.mqttClient = null;
    this.mqtttopic = process.env.DEST_MQTT_TOPIC;
    //this.mqtttopic = 'mainchannel'

    var mqttdestination = typeof process.env.DEST_MQTT_HOST !== "undefined" ? 'mqtt://' + process.env.DEST_MQTT_HOST : 'mqtt://localhost';
    var wsmqttdestination = typeof process.env.DEST_MQTT_HOST !== "undefined" ? 'ws://' + process.env.DEST_MQTT_HOST + ":9001/" : 'ws://localhost:9001';
    var wsmqttport = typeof process.env.DEST_MQTT_PORT !== "undefined" ? process.env.DEST_MQTT_PORT : 9001
    var wsmqttdestination = typeof process.env.DEST_MQTT_HOST !== "undefined" ? 'ws://' + process.env.DEST_MQTT_HOST + ':' + wsmqttport  : 'ws://localhost:' + wsmqttport

    this.authenticationSet = typeof process.env.DEST_MQTT_DEVICEID !== "undefined" ? true : false;
    //this.host = 'mqtt://' + process.env.DEST_MQTT_HOST;
    this.host = process.env.USE_WS === "true" ?  wsmqttdestination : mqttdestination;
    this.deviceid = process.env.DEST_MQTT_DEVICEID; // mqtt credentials if these are needed to connect
    this.password = process.env.DEST_MQTT_PWD;

    this.mqtt_username_dst = typeof process.env.MQTT_USERNAME_DEST !== "undefined" ? process.env.MQTT_USERNAME_DEST : 'mqtt';
    this.mqtt_password_dst = typeof process.env.MQTT_PASSWORD_DEST !== "undefined" ? process.env.MQTT_PASSWORD_DEST : 'mqtt';

  }

  connect() {
    // Connect mqtt with credentials (in case of needed, otherwise we can omit 2nd param)
    //this.mqttClient = mqtt.connect(this.host, { username: this.username, password: this.password });

    var settings = {
      keepalive: 2000,
      username: this.mqtt_username_dst,
      password: this.mqtt_password_dst,
      path: mqttpath
    }

    if (this.authenticationSet){
     
      //this.mqttClient = mqtt.connect(this.host, settings);
      var azurehost = "mqtts://" +  process.env.DEST_MQTT_HOST + ":8883"
      var username = process.env.DEST_MQTT_HOST + "/" + process.env.DEST_MQTT_DEVICEID + "/?api-version=2018-06-30"
      console.log("<sender> we need auth for outgoing mqtt " + azurehost + " " + username + " " + this.password);


      this.mqttClient = mqtt.connect(azurehost, { 
        clientId: this.deviceid,
        username: username, 
        password: this.password });
      

    } else {
      console.log("<sender> no auth set for outgoing mqtt"+ this.authenticationSet + " " + this.username + " " + this.password);
      this.mqttClient = mqtt.connect(this.host, settings);
      console.log("<sender> DEST_MQTT_HOST: " +  this.host  + mqttpath)
    }
  
  
    // Mqtt error calback
    this.mqttClient.on('error', (err) => {
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
