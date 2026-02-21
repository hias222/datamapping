var swimEvent = require('../data/swim_event')
var PropertyReader = require('properties-reader')

var fs = require('fs');
var unzipper = require('unzipper')

var MqttMessageSender = require('../mqtt/mqtt_message_sender')
var mqttMessageSender = new MqttMessageSender()

require('dotenv').config();

var incoming_debug = process.env.MQTT_INCOMING_DEBUG === 'true' ? true : false;
var first_lane = typeof process.env.POOL_FIRST_LANE !== "undefined" ? process.env.POOL_FIRST_LANE : 1;

var propertyfile = __dirname + "/../" + process.env.PROPERTY_FILE;
console.log("<incoming> using " + propertyfile);
var properties = PropertyReader(propertyfile)
var lenex_file = properties.get("main.lenex_startlist")
console.log("<incoming> using file " + lenex_file);

var myEvent = new swimEvent(lenex_file);
//var myEvent = new swimEvent("resources/170114-Schwandorf-ME.lef");

var race_running = false;

const actions = {
    HEADER: 'header',
    RACE: 'race',
    LANE: 'lane',
    START: 'start',
    STOP: 'stop',
    CLOCK: 'clock',
    CLEAR: 'clear',
    MESSAGE: 'message',
    VIDEO: 'video',
    LENEX: 'lenex',
    CONFIGURATION: 'configuration',
    STARTLIST: 'startlist',
    TIME: 'time',
    RESTART: 'restart',
    ROUND: 'round',
    BEST3: 'best3',
    PRESENTLANE: 'presentlane'
}

exports.parseColoradoData = function (message) {
    var messagetype = getMessageType(message.toString());
    if (incoming_debug) console.log('<incoming> Type: ' + messagetype)
    try {
        switch (messagetype) {
            case actions.HEADER:
                //store state
                myEvent.getInternalHeatId(getEvent(message), getHeat(message));
                return myEvent.getEventName(getEvent(message))
                break;
            case actions.RACE:
                var jsonsrace = "{ \"type\": \"race\", \"time\": \"" + Math.floor(new Date() / 1000) + "\" }"
                return JSON.parse(jsonsrace);
                break;
            case actions.LANE:
                var newmessage = myEvent.getActualSwimmer(getLaneNumber(message), getTime(message), getPlace(message));
                return newmessage;
                break;
            case actions.START:
                var jsonstart = "{ \"type\": \"start\", \"time\": \"" + Math.floor(new Date() / 1000) + "\" }"
                return JSON.parse(jsonstart);
                break;
            case actions.STOP:
                var jsonstart = "{ \"type\": \"stop\", \"time\": \"" + Math.floor(new Date() / 1000) + "\" }"
                race_running = false;
                return JSON.parse(jsonstart);
                break;
            case actions.CLOCK:
                var jsonclock = "{ \"type\": \"clock\", \"size\": \"large\", \"time\": \"" + Math.floor(new Date() / 1000) + "\" }"
                return JSON.parse(jsonclock);
                break;
            case actions.CLEAR:
                //todo reset the times
                var jsonclear = "{ \"type\": \"clear\", \"time\": \"" + Math.floor(new Date() / 1000) + "\" }"
                return JSON.parse(jsonclear);
                break;
            case actions.STARTLIST:
                var jsonstartlist = "{ \"type\": \"startlist\", \"time\": \"" + Math.floor(new Date() / 1000) + "\" }"
                return JSON.parse(jsonstartlist);
                break;
            case actions.VIDEO:
                var jsonvideo = "{ \"type\": \"video\", \"version\": \"" + getVideoName(message).toString() + "\", \"time\": \"" + Math.floor(new Date() / 1000) + "\" }"
                return JSON.parse(jsonvideo);
                break;
            case actions.MESSAGE:
                var clearMessage = clearMessageText(message)
                var jsonmsg = "{ \"type\": \"message\", \"value\": \"" + getMessage(clearMessage) + "\", \"time\": \"" + Math.floor(new Date() / 1000) + "\" }"
                return JSON.parse(jsonmsg);
                break;
            case actions.TIME:
                var jsonmsg = "{ \"type\": \"time\", \"value\": \"" + getTimeState(message) + "\" }"
                //todo -> set running if time > 0 
                // if missed start
                return JSON.parse(jsonmsg);
                break;
            case actions.LENEX:
                var newfilename = getMessage(message)
                console.log("lenex " + newfilename)
                getNewLenexFile(newfilename);
                var jsonlenex = "{ \"type\": \"lenex\", \"value\": \"" + getMessage(message) + "\", \"time\": \"" + Math.floor(new Date() / 1000) + "\" }"
                return JSON.parse(jsonlenex);
                break;
            case actions.ROUND:
                console.log("new round ")
                var jsonround = "{ \"type\": \"round\", \"value\": \"" + getRound(message) + "\", \"time\": \"" + Math.floor(new Date() / 1000) + "\" }"
                return JSON.parse(jsonround);
            case actions.RESTART:
                console.log("restart --- to be implemented ")
                process.exit(0);
            case actions.CONFIGURATION:
                var configuration = getMessage(message)
                if (getMessageWord1(message) == "event_type") {
                    mqttMessageSender.sendMessage("configuration change " + getMessageWord1(message))
                    console.log("configuration " + configuration)
                    if (myEvent.setEventType(getMessageWord2(message))) {
                        mqttMessageSender.sendMessage("configuration updated " + getMessageWord2(message))
                    } else {
                        mqttMessageSender.sendMessage("configuration updated failed " + getMessageWord2(message))
                    }
                }
                return null
                break;
            case actions.BEST3:
                console.log("BEST3")
                var jsonbest3 = "{ \"type\": \"best3\", \"time\": \"" + Math.floor(new Date() / 1000) + "\" }"
                return JSON.parse(jsonbest3);
            case actions.PRESENTLANE:
                var presentlane = "{ \"type\": \"presentlane\", \"value\": \"" + getRound(message) + "\", \"time\": \"" + Math.floor(new Date() / 1000) + "\" }"
                return JSON.parse(presentlane);
            default:
                console.log('Type:  not declared')
                break;
        }
    } catch (e) {
        console.log(e)
        return "unknown"
    }
    return "unknown"
}

exports.getTimeState = function () {
    return race_running
}

async function getNewLenexFile(filename) {

    //var lenexfile = __dirname + '/../uploads/' + filename;
    var lenexfile = process.env.LENEX_BASE_DIR + '/' + filename;
    var destlenexpath = __dirname + '/../resources';
    var destpath = __dirname + '/../resources/' + filename.split('.').slice(0, -1).join('.') + ".lef"
    var destfilename = 'resources/' + filename.split('.').slice(0, -1).join('.') + ".lef"

    console.log("<incoming> check " + lenexfile)
    console.log("<incoming> dest " + destpath)

    try {
        console.log("<incoming> load new file " + filename)
        fs.access(lenexfile, fs.F_OK, (err) => {
            if (err) {
                console.log("<incoming> extract not exists " + lenexfile)
                console.error(err);
                //mqttMessageSender.sendMessage("lenex not exists " + lenexfile)
                return;
            }
            // file exists
            console.log("<incoming> use lxf " + lenexfile)

            fs.createReadStream(lenexfile)
                .pipe(unzipper.Extract({ path: destlenexpath }))
                .on('error', (err) => {
                    console.log("<incoming> error extract " + lenexfile)
                    console.log(err)
                    mqttMessageSender.sendMessage("lenex error extract " + lenexfile)
                })
                //.promise()
                .on('finish', (success) => {
                    console.log("<incoming> success extract")
                })
                .on('close', () => {
                    console.log("<incoming> extract close finish")
                    fs.access(destpath, fs.F_OK, (err) => {
                        if (err) {
                            console.log("<incoming> not exists " + destpath)
                            console.error(err);
                            return;
                        }
                        console.log("<incoming> old event " + JSON.stringify(myEvent.getCompetitionName()))
                        console.log("<incoming> switch to " + destfilename)
                        myEvent.updateFile(destfilename)
                        console.log("<incoming> new event " + JSON.stringify(myEvent.getCompetitionName()))
                        mqttMessageSender.sendMessage("lenex updated " + myEvent.filename)
                    })

                })
        });


    } catch (Exception) {
        console.log("<incoming> error extract ")
        console.log(Exception)
        mqttMessageSender.sendMessage("lenex error extract " + Exception)
    }
}

function getMessageType(message) {
    try {
        var newactions = message.replace(/ .*/, '');
        //console.log("<incoming> message with action: " + newactions)
        if (Object.values(actions).includes(newactions)) {
            return newactions;
        } else {
            var clearstring = message.replace(/\n|\r|\t/g, " ");
            var actionclear = clearstring.replace(/ .*/, '');
            if (Object.values(actions).includes(actionclear)) {
                return actionclear;
            } else {
                return "unknown";
            }
        }
    } catch (e) {
        console.log(e)
        return "unknown";
    }
}

function clearMessageText(message) {
    var strmessage = message.toString();
    var newMessage = strmessage.replace(/\n/g, "\\\\n").replace(/\r/g, "\\\\r").replace(/\t/g, "\\\\t");
    return newMessage;
}

function getTimeState(message) {
    var words = message.toString().split(' ');
    try {
        var time = words[1]
        if (time === "00:00,0") {
            race_running = false;
            console.log("--stop");
        } else {
            race_running = true;
        }
        return time
    } catch (err) {
        console.log(err)
        return 0
    }
}

function getHeat(message) {
    var words = message.toString().split(' ');
    //header wk heat
    console.log("HEAT: " + words[2]);
    try {
        var numberHeat = parseInt(words[2])
        return numberHeat
    } catch (err) {
        console.log(err)
        return 0
    }
}

function getVideoName(message) {
    try {
        var newStr = message.toString().substr(message.indexOf(" ") + 1);
        return newStr
    } catch (err) {
        console.log(err)
        return ""
    }
}

function getMessage(message) {
    try {
        var newStr = message.toString().substr(message.indexOf(" ") + 1);
        return newStr
    } catch (err) {
        console.log(err)
        return ""
    }
}

function getEvent(message) {
    var words = message.toString().split(' ');
    //header wk heat
    console.log("Event: -" + words[1] + "-");
    try {
        var numberevent = parseInt(words[1])
        return numberevent
    } catch (err) {
        console.log(err)
        return 0
    }
}

function getRound(message) {
    var words = message.toString().split(' ');
    //header wk heat
    console.log("Round/Lane: -" + words[1] + "-");
    try {
        var numberround = parseInt(words[1])
        return numberround
    } catch (err) {
        console.log(err)
        return 0
    }
}

function getMessageWord1(message) {
    var words = message.toString().split(' ');
    //header wk heat
    console.log("Word1: -" + words[1] + "-");
    return words[1];
}

function getMessageWord2(message) {
    var words = message.toString().split(' ');
    //header wk heat
    console.log("Word2: -" + words[2] + "-");
    return words[2];
}

function getLaneNumber(message) {
    var words = message.toString().split(' ');
    //header wk heat
    if (first_lane == 0) {
        // wir korrigieren, da colorado immer mit 1 beginnt, auch wenn die erste Bahn 0 ist, das führt zu Problemen bei der Zuordnung der Schwimmerdaten, da die Bahnnummern um 1 verschoben sind
        corrected_lane = words[1] - 1
        if (incoming_debug) console.log("(incoming.js)lane (mit 0): " + corrected_lane);
        return corrected_lane
    } else {
        if (incoming_debug) console.log("(incoming.js)lane (ohne 0): " + words[1]);
        return words[1]
    }
}

function getPlace(message) {
    var words = message.toString().split(' ');
    if (incoming_debug) console.log("(place)lane: " + words[3]);
    return words[3]
}

function getTime(message) {
    var words = message.toString().split(' ');
    //header wk heat
    if (incoming_debug) console.log("(time)lane: " + words[2]);
    return words[2]
}

module.exports.test = (a, b, callback) => {
    let sum = a + b
    let error = null
    callback(error, sum) // invoke the callback function
}
