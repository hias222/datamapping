const mqtt = require('mqtt');
require('dotenv').config();

//const autoBind = require('auto-bind');
var messageMapper = require('./message_mapper')
var messageMapper = new messageMapper();

var lastMessage = '';
var ConnectedRaw = false;

var SendMessage = '';

var settings = {
  keepalive: 2000
}

class MqttHandler {
  constructor() {
    //super(onMessageChange);
    this.mqttClient = null;
    this.rawtopic = 'rawdata'
    this.host = 'mqtt://localhost';
    this.username = 'YOUR_USER'; // mqtt credentials if these are needed to connect
    this.password = 'YOUR_PASSWORD';
    this.connectToMqtt = this.connectToMqtt.bind(this)
    //autoBind(this);
  }

  connectToMqtt() {
    this.mqttClient = mqtt.connect(this.host, settings);
  }

  connect() {
    // Connect mqtt with credentials (in case of needed, otherwise we can omit 2nd param)
    //this.mqttClient = mqtt.connect(this.host, { username: this.username, password: this.password });

    this.connectToMqtt()
    //this.mqttClient = mqtt.connect(this.host, settings);

    // Mqtt error calback
    this.mqttClient.on('error', (err) => {
      console.log(err);
      ConnectedRaw = false;
      this.mqttClient.end();
    });

    // Connection callback
    this.mqttClient.on('connect', () => {
      console.log(`mqtt_handler raw client connected`);
      ConnectedRaw = true;
    });

    // mqtt subscriptions
    this.mqttClient.subscribe(this.rawtopic, { qos: 0 });

    // When a message arrives, console.log it
    this.mqttClient.on('message', function (topic, message) {
      console.log("mqtt_handler datamapping incoming " + message.toString());
      SendMessage = messageMapper.mapMessage(message)
      lastMessage = message;
    });

    this.mqttClient.on('close', () => {
      console.log(`mqtt_handler raw client disconnected`);
      SendMessage = messageMapper.mapMessage("connection abort")
      ConnectedRaw = false;
    });

  }

  // Sends a mqtt message to topic: mytopic
  sendRawMessage(message) {
    this.mqttClient.publish(this.rawtopic, message);
  }

  getLastMessage() {
    return lastMessage;
  }

  getLastSendMessage() {
    return SendMessage;
  }

  getStatus() {
    return ConnectedRaw;
  }

  getSendStatus() {
    return messageMapper.getsendStatus();
  }
}

module.exports = MqttHandler;
