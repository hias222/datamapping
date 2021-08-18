var mqttSender = require('./mqtt_sender');
var incoming = require('../incoming/incoming')
var mqttSender = new mqttSender();

var sendStatus = false;
var race_running = false;
var lastEvent = 0;
var lastHeat = 0;
var lanemessages = [];

require('dotenv').config();

var mapper_debug = process.env.MQTT_MAPPER_DEBUG === 'true' ? true : false;


//var lanes = 8;
var lanes = typeof process.env.NUMBER_LANES !== "undefined" ? process.env.NUMBER_LANES : 8;


function storeLaneData(lane, laneraw) {
  try {
    console.log("<message_mapper> store lane " + lane + ": " + laneraw)
    var lanenumber = (lane - 1)
    var number_of_elements_to_remove = 1
    lanemessages.splice(lanenumber, number_of_elements_to_remove, laneraw);
  } catch (err) {
    console.log(err)
  }
}

class MessageMapper {
  constructor() {
    mqttSender.connect();
    if (mapper_debug) console.log("<mapper> use " + lanes + " lanes")
  }

  // Sends a mqtt message to topic: mytopic
  async mapMessage(message) {
    try {
      if (mapper_debug) console.log("<message_mapper> beginn parse")
      var newmessage = incoming.parseColoradoData(message)
      if (mapper_debug) console.log("<message_mapper> aditional steps check")
      if (newmessage != null) {
        if (mapper_debug) console.log("<message_mapper> generate message")
        var stringnewmessage = JSON.stringify(newmessage)
        if (mapper_debug) console.log("<mapper> datamapping mapper: " + stringnewmessage)
        try {
          if (newmessage.type !== "lane") {
            sendStatus = mqttSender.sendMessage(stringnewmessage);
          } else if (race_running) {
            sendStatus = mqttSender.sendMessage(stringnewmessage);
          }

          if (!race_running) {
            race_running = incoming.getTimeState()
          }

          if (newmessage.type === "header") {
            if (mapper_debug) console.log("<mapper> message header")
            if (newmessage.event != lastEvent || newmessage.heat != lastHeat) {
              lastEvent = newmessage.event
              lastHeat = newmessage.heat
              lanemessages = []
              console.log("<mapper> Store heat")
              for (var i = 0; i < lanes; i++) {
                //we send all lanes
                var incomingmsg = "lane " + (i + 1);
                storeLaneData(i + 1, incomingmsg);
                var newlanemessage = incoming.parseColoradoData(incomingmsg.toString())
                var stringnewlanemessage = JSON.stringify(newlanemessage)
                mqttSender.sendMessage(stringnewlanemessage);
              }
            }
          } else if (newmessage.type === "start") {
            race_running = true;
            //clear data
            lanemessages = []
            for (var i = 0; i < lanes; i++) {
              //we send all lanes
              var incomingmsg = "lane " + (i + 1);
              storeLaneData(i + 1, incomingmsg);
              var newlanemessage = incoming.parseColoradoData(incomingmsg.toString())
              var stringnewlanemessage = JSON.stringify(newlanemessage)
              mqttSender.sendMessage(stringnewlanemessage);
            }
          } else if (newmessage.type === "stop") {
            race_running = false;
            lanemessages = []
          }
          else if (newmessage.type === "race") {
            // zeiten speichern?
            console.log("race " + lastEvent)
            var incomingheader = "header " + lastEvent + " " + lastHeat
            var newlanemessageheader = incoming.parseColoradoData(incomingheader.toString())
            var stringnewlaneheader = JSON.stringify(newlanemessageheader)
            mqttSender.sendMessage(stringnewlaneheader);
            for (let lanedata of lanemessages) {
              console.log("<message_mapper> race out " + lanedata);
              var storedlanedata = incoming.parseColoradoData(lanedata.toString())
              mqttSender.sendMessage(JSON.stringify(storedlanedata));
            }
          } else if (newmessage.type === "lane") {
            storeLaneData(newmessage.lane, message);
          } else if (newmessage.type === "clear") {
            console.log("<message_mapper> clear race")
            for (let lanedata of lanemessages) {
              console.log("<message_mapper> race out " + lanedata);
              var storedlanedata = incoming.parseColoradoData(lanedata.toString())
              storedlanedata.time = ''
              storedlanedata.place = ''
              mqttSender.sendMessage(JSON.stringify(storedlanedata));
            }
          }
        } catch (err) {
          console.log(err)
          console.log(" <mapper> message_mapper wrong old heat")
        }
      }
    } catch (err) {
      stringnewmessage = "failed mapping"
    }
    return stringnewmessage;
  }

  getsendStatus() {
    return sendStatus
  }
}

module.exports = MessageMapper;
