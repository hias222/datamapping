var lanemessages = []

var headermessage = {
    type: 'header',
    competition: 'not defined',
    distance: '50',
    swimstyle: 'FREE',
    event: '0',
    heat: '0'
};

var start = { type: 'start' };
var laststart = Date.now();

var storetopic = typeof process.env.DEST_STORE_TOPIC !== "undefined" ? process.env.DEST_STORE_TOPIC : 'storechannel';
var debug = process.env.MQTT_SENDER_DEBUG === 'true' ? true : false;

function storeBaseData(message, mqttSender) {
    try {
        var jsonmessage = JSON.parse(message)
        if (debug) console.log('Store Type: ' + jsonmessage.type)
        if (jsonmessage.type == "header") {
            headermessage = jsonmessage
            if (start.type === 'clock' || start.type === 'message') {
                console.log("<app> --> reset " + start.type)
                var recallmessage = "{\"type\":\"race\"}"
                start = JSON.parse(recallmessage)
            }
        }

        if (jsonmessage.type == "race") {
            start = jsonmessage
        }

        if (jsonmessage.type == "startlist") {
            start = jsonmessage
        }

        if (jsonmessage.type == "start") {
            laststart = Date.now()
            start = jsonmessage
        }

        if (jsonmessage.type == "stop") {
            // we send it to datahub
            running = false
            var newmessage = { ...headermessage, lanes: lanemessages }
            if (debug)  console.log(JSON.stringify(JSON.stringify(newmessage)))
            mqttSender.publish(storetopic, JSON.stringify(newmessage), function (err) {
                if (err) {
                  console.log(err)
                }
              })
            console.log('<sendStoreData> Heat ' + headermessage.heat + ' send to ' + storetopic)
            start = jsonmessage
        }

        if (jsonmessage.type == "clock") {
            timestart = Date.now()
            start = jsonmessage
        }

        if (jsonmessage.type == "message") {
            timestart = Date.now()
            start = jsonmessage
        }

        if (jsonmessage.type == "clear") {
            console.log("clear lanes")
            lanemessages = []
        }

        if (jsonmessage.type == "lane") {
            running = true
            var lanenumber = (jsonmessage.lane - 1)
            var number_of_elements_to_remove = 1
            lanemessages.splice(lanenumber, number_of_elements_to_remove, jsonmessage);
        }
    } catch (err) {
        console.log("<app.js> error")
        console.log(err)
    }
}

exports.storeBaseData = storeBaseData