const xml2js = require('xml2js');
const fs = require('fs');
const parser = new xml2js.Parser({ attrkey: "ATTR" });
const jmespath = require('jmespath');

var PropertyReader = require('properties-reader')

// todo check env exists

require('dotenv').config();

var event_debug = process.env.MQTT_EVENT_DEBUG === 'true' ? true : false;

var propertyfile = __dirname + "/../" + process.env.PROPERTY_FILE;
var properties = PropertyReader(propertyfile)

var MqttMessageSender = require('../mqtt/mqtt_message_sender')
var mqttMessageSender = new MqttMessageSender()

var event_all = null
var event_sessions = null;
var event_heatid = null;
var event_swimmer = null;
var event_relay = null;
var event_clubs = null;

var event_type = properties.get("main.event_type")

var internalheadID = "1";
var actual_heat = "1";
var actual_event = "1";
var relay_count = "1";

const event_type_values = {
    FINALE: 'FIN',
    VORLAEUFE: 'PRE',
    DIREKT: 'TIM',
    ALL: 'ALL'
}

class swimevent {

    constructor(filename) {
        this.filename = filename
        try {
            this.xml_string = fs.readFileSync(filename, "utf8");
            this.readFile()
        } catch (Exception) {
            mqttMessageSender.sendMessage("lenex failure load <swim_event initial> " + this.filename)
            console.log(Exception)
        }
        console.log("<swim_event> Event type " + event_type)
    }

    async updateFile(filename) {
        this.filename = filename
        try {
            const data = fs.readFileSync(filename, 'utf8')
            console.log('<swim_event> ' + filename + ' read it ')
            this.xml_string = data;
            this.readFile();
        } catch (Exception) {
            mqttMessageSender.sendMessage("<swim_event> <updateFile> lenex failure load " + this.filename)
            console.log(Exception)
        }
        // update file name
        var lenex_file = properties.get("main.lenex_startlist")
        console.log("<swim_event> property old file " + lenex_file)
        properties.set("main.lenex_startlist", filename);
        properties.save(propertyfile)
        lenex_file = properties.get("main.lenex_startlist")
        console.log("<swim_event> property new file " + lenex_file)
    }

    readFile() {
        console.log("<swim_event> read " + this.filename)
        try {
            parser.parseString(this.xml_string, function (error, result) {
                if (error === null) {
                    mqttMessageSender.sendMessage("lenex success upload new lenex file")
                    event_all = result;
                    event_swimmer = jmespath.search(result.LENEX.MEETS[0].MEET[0], "CLUBS[].CLUB[].ATHLETES[].ATHLETE[]")
                    event_clubs = result.LENEX.MEETS[0].MEET[0].CLUBS[0].CLUB
                    event_heatid = jmespath.search(result.LENEX.MEETS[0].MEET[0].SESSIONS, "[].SESSION[].EVENTS[].EVENT[]");
                    event_sessions = jmespath.search(result.LENEX.MEETS[0].MEET[0].SESSIONS, "[].SESSION[].EVENTS[].EVENT[]")
                } else {
                    mqttMessageSender.sendMessage("<swim_event> lenex error " + error)
                    console.log(error);
                }
            });
        } catch (Exception) {
            mqttMessageSender.sendMessage("<swim_event> lenex failure load  " + this.filename)
            console.log(Exception)
        }
    }


    getCompetitionName() {
        try {
            var shortname = "{ \"competition\": \"" + event_all.LENEX.MEETS[0].MEET[0].ATTR.name + "\"}"
            return JSON.parse(shortname);
        } catch (Exception) {
            mqttMessageSender.sendMessage("<swim_event> lenex failure load getCompetitionName")
            console.log(Exception)
            return null;
        }
    }

    getInternalHeatId(eventnumber, heatnumber) {
        console.log("<swim_events> getInternalHeatId " + eventnumber + " " + heatnumber)
        try {
            actual_event = eventnumber;
            actual_heat = heatnumber;
            if (event_type === event_type_values.ALL) {
                var searchstring = "[?ATTR.number == '" + eventnumber + "'].HEATS[*].HEAT[*]"
                var tmp_heats = jmespath.search(event_heatid, searchstring)[0][0];
                var searchheat = "[?ATTR.number == '" + heatnumber + "'].ATTR.heatid"
                var newid = jmespath.search(tmp_heats, searchheat).toString()
                internalheadID = newid
                console.log("<swim_event> number heats " + newid)
                return newid;
            } else {
                console.log("<swim_events> mode " + event_type)
                var searchstring = "[?ATTR.number == '" + eventnumber + "' && ATTR.round == '" + event_type + "'].HEATS[*].HEAT[*]"
                //var myarray = jmespath.search(event_heatid, searchstring);
                var tmp_heats = jmespath.search(event_heatid, searchstring)[0][0];
                var searchheat = "[?ATTR.number == '" + heatnumber + "'].ATTR.heatid"
                var newid = jmespath.search(tmp_heats, searchheat).toString()
                internalheadID = newid
                console.log("<swim_event> number round heat " + newid)
                return newid;
            }
        } catch (err) {
            console.log("<swim_events> getInternalHeatId crash " + eventnumber + " " + heatnumber + " mode " + event_type)
            console.log("<swim_events> nothing found !!!")
            //console.log(err)
            internalheadID = 0;
            return new Object();
        }
    }

    getEventName(number) {
        console.log("<swim_event> search for number " + number)
        var emptyevent = "{ \"type\": \"header\", \"relaycount\": \"1\", \"event\": \"" + actual_event + "\", \"heat\": \"" + actual_heat + "\" }"
        try {
            var searchstring = "[?ATTR.number == '" + number + "']"
            var tmp = jmespath.search(event_sessions, searchstring);
            var attributsearch = "[].{event: ATTR.number, gender: ATTR.gender, round: ATTR.round, relaycount: SWIMSTYLE[0].ATTR.relaycount, swimstyle: SWIMSTYLE[0].ATTR.stroke, distance: SWIMSTYLE[0].ATTR.distance, name: SWIMSTYLE[0].ATTR.name }"
            var searcharray = jmespath.search(tmp, attributsearch);
            if (searcharray.length > 1 && event_type !== event_type_values.ALL) {
                console.log("<swim_event> wir müssen nochmal filtern " + event_type)
                for (let eventnames of searcharray) {
                    if (eventnames.round.toString() === event_type) {
                        console.log("<swim_event> geteventname found " + eventnames.round);
                        var eventdata = eventnames;
                        relay_count = typeof eventdata !== "undefined" ? eventdata.relaycount : "1";
                        var eventresult = typeof eventdata !== "undefined" ? eventdata : JSON.parse(emptyevent);
                        return { ...JSON.parse(emptyevent), ...eventresult, ...this.getCompetitionName() };
                    }
                }
            } else {
                console.log("<swim_event> single event")
                var eventdata = jmespath.search(tmp, attributsearch)[0];
                relay_count = typeof eventdata !== "undefined" ? eventdata.relaycount : "1";
                var eventresult = typeof eventdata !== "undefined" ? eventdata : JSON.parse(emptyevent);
                return { ...JSON.parse(emptyevent), ...eventresult, ...this.getCompetitionName() };
            }
        } catch (err) {
            console.log("<swim_event> eemptyevent")
            console.log(err)
            try {
                return JSON.parse(emptyevent);
            } catch (err) {
                console.log("<swim_event> error return nullevent")
                var nullevent = "{\"type\":\"header\",\"event\":\"0\",\"heat\":\"0\"}"
                return JSON.parse(nullevent);
            }
        }
    }

    getActualSwimmer(lane, time, place) {
        var emptylane = "{ \"type\": \"lane\", \"lane\": \"" +
            lane + "\", \"event\": \"" +
            actual_event + "\", \"place\": \"" +
            place + "\", \"finishtime\": \"" +
            time + "\", \"heat\": \"" +
            actual_heat + "\" }"
        try {
            var lastswimmer = this.getSwimmerHeat(internalheadID, lane);
            if (event_debug) console.log("<swim_event> lastswimmer")
            //console.log(lastswimmer)
            //var searchstring = "[?lane == '" + lane + "']"
            //var tmp = jmespath.search(lastswimmers, searchstring);
            //[].relay[][].RELAYPOSITION[].ATTR
            var swimmer = typeof lastswimmer[0] !== "undefined" ? lastswimmer[0] : JSON.parse(emptylane);
            if (typeof swimmer.athleteid !== "undefined") {
                if (event_debug) console.log("<swim_event> type single")
                var club = this.getSwimmerClub(lastswimmer[0].athleteid)
                return { ...swimmer, ...club[0], ...JSON.parse(emptylane) };
            } else if (typeof swimmer.round !== "undefined") {
                console.log("<swim_event> type relay")
                return { ...JSON.parse(emptylane), ...swimmer };
            } else {
                if (event_debug) console.log("<swim_event> type nothing")
                return swimmer;
            }
        } catch (err) {
            console.log(err)
            try {
                return JSON.parse(emptylane);
            } catch (err) {
                var nulllane = "{\"type\":\"lane\",\"lane\":\"0\",\"event\":\"0\",\"place\":\"0\",\"finishtime\":\"0\",\"heat\":\"0\"}"
                return JSON.parse(nulllane);
            }
        }
    }


    getRelayHeat(internalHeatID, lane) {
        console.log("<swim_event> get relay for internalheatid " + internalHeatID + " no relay lane " + lane)
        var emptylane = "{ \"round\": \"4\"}"

        var searchstring = "[?RELAYS[?RELAY[?ENTRIES[?ENTRY[?ATTR.heatid == '" + internalHeatID + "' && ATTR.lane == '" + lane + "' ]]]]]"
        var tmp = jmespath.search(event_clubs, searchstring);

        var all_entries_only = jmespath.search(event_clubs, "[].RELAYS[].RELAY[].ENTRIES[].ENTRY[?ATTR.heatid == '" + internalHeatID + "' && ATTR.lane == '" + lane + "']")
        var single_entry = jmespath.search(all_entries_only, "[]")
        var cleared_entry = jmespath.search(single_entry, "[].{entrytime: ATTR.entrytime, lane: ATTR.lane, RELAYPOSTIONS: RELAYPOSITIONS[].RELAYPOSITION}")

        var get_club_Search = "[].{code: ATTR.code, name: ATTR.name}"
        var club_per_lane = jmespath.search(tmp, get_club_Search);

        var complete_entry = [{ ...JSON.parse(emptylane), ...club_per_lane[0], ...cleared_entry[0] }]

        //console.log(JSON.stringify(complete_entry))

        return complete_entry;

    }

    getSingleSwimmerHeat(internalHeatID, lane) {
        if (event_debug) console.log("<swim_event> get swimmer for internalheatid " + internalHeatID + " no relay lane " + lane)
        var searchstring = "[?ENTRIES[?ENTRY[?ATTR.heatid == '" + internalHeatID + "']]] " // | [?ENTRIES[?ENTRY[?ATTR.lane == '" + lane + "']]]"
        var tmp = jmespath.search(event_swimmer, searchstring);
        //console.log(tmp[0].ENTRIES[0].ENTRY)
        //console.log("getswimmerheate number swimmers " +  tmp.length)
        var searchstring2 = "[].{athleteid: ATTR.athleteid, birthdate: ATTR.birthdate, firstname: ATTR.firstname, lastname: ATTR.lastname, birthdate: ATTR.birthdate , \
            lane: ENTRIES[0].ENTRY[?ATTR.heatid == '" + internalHeatID + "'].ATTR.lane , \
            entrytime: ENTRIES[0].ENTRY[?ATTR.heatid == '" + internalHeatID + "'].ATTR.entrytime}"
        var tmp2 = jmespath.search(tmp, searchstring2);

        var searchstring3 = "[].{athleteid: athleteid, birthdate: birthdate, firstname: firstname, lastname: lastname, lane: lane[0], entrytime: entrytime[0] }"
        var tmp3 = jmespath.search(tmp2, searchstring3);

        var searchstring4 = "[?lane == '" + lane + "']"
        var tmp4 = jmespath.search(tmp3, searchstring4);

        return tmp4
    }

    getSwimmerHeat(internalHeatID, lane) {
        if (relay_count === "1") {
            return this.getSingleSwimmerHeat(internalHeatID, lane)
        } else {
            return this.getRelayHeat(internalHeatID, lane)
        }
    }

    getSwimmerClub(swimmerid) {
        var searchstring = "[?ATHLETES[?ATHLETE[?ATTR.athleteid == '" + swimmerid + "']]]"
        var tmp = jmespath.search(event_clubs, searchstring);
        var searchstring2 = "[].{name: ATTR.name, code: ATTR.code}"
        return jmespath.search(tmp, searchstring2);
    }

    setEventType(type) {
        if (Object.values(event_type_values).includes(type)) {
            properties.set("main.event_type", type);
            properties.save(propertyfile);
            event_type = type
            return true;
        }
        return false;
    }

    getEventType() {
        return event_type;
    }
}

module.exports = swimevent;