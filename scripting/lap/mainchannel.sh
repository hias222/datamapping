#!/bin/bash 

MQTT_HOST=localhost
#MQTT_HOST=192.168.178.152
RAW_TOPIC=mainchannel

RANDOM_TIME="1:1,1"

ROUND="PRE"

NUMBER_EVENTS=22
NUMBER_HEATS=4

send_main_message(){
    echo main: $1
    NEW_MESSAGE="{\"type\":\"$1\",\"size\":\"large\",\"finishtime\":\"1569662431\"}"
    mosquitto_pub -h $MQTT_HOST -t $RAW_TOPIC -m "$NEW_MESSAGE"
}

send_header_message(){
    echo header: $1 - $2
    NEW_MESSAGE="{\"event\":\"$1\",\"gender\":\"F\",\"round\":\"$ROUND\",\"relaycount\":\"1\",\"swimstyle\":\"FREE\",\"distance\":\"100\",\"type\":\"header\",\"heat\":\"$2\",\"competition\":\"Meisterschaften 2016\"}"
    mosquitto_pub -h $MQTT_HOST -t $RAW_TOPIC -m "$NEW_MESSAGE"
}


# {"type":"lane","lane":"1","event":"1","place":"undefined","finishtime":"undefined","heat":"1"}

send_empty_lane(){
    echo empty lane: $1 - $2 - $3
    NEW_MESSAGE="{\"lane\":\"$1\",\"type\":\"lane\",\"event\":\"$2\",\"place\":\"undefined\",\"finishtime\":\"undefined\",\"heat\":\"$3\"}"
    mosquitto_pub -h $MQTT_HOST -t $RAW_TOPIC -m "$NEW_MESSAGE"
}

send_lane(){
    echo lane: $1 - $2 - $3 -$4
    NEW_MESSAGE="{\"athleteid\":\"4002\",\"birthdate\":\"2001-01-01\",\"firstname\":\"Max\",\"lastname\":\"Bahn_$1\", \
    \"lane\":\"$1\",\"entrytime\":\"$4\",\"name\":\"SG Mittelfranken\",\"code\":\"6768\",\"type\":\"lane\",\"event\":\"$2\",\"place\":\"undefined\",\"finishtime\":\"undefined\",\"heat\":\"$3\"}"
    mosquitto_pub -h $MQTT_HOST -t $RAW_TOPIC -m "$NEW_MESSAGE"
}


send_lane_message(){
    echo lane: $1 - $2 - $3 - $5
    NEW_MESSAGE="{\"athleteid\":\"4002\",\"birthdate\":\"2001-01-01\",\"firstname\":\"Max\",\"lastname\":\"Bahn_$1\", \
    \"lane\":\"$1\",\"entrytime\":\"00:01:04.90\",\"name\":\"SG Mittelfranken\",\"code\":\"6768\",\"type\":\"lane\",\"event\":\"$2\",\"place\":\"$3\",\"finishtime\":\"$4\",\"heat\":\"$5\"}"
    mosquitto_pub -h $MQTT_HOST -t $RAW_TOPIC -m "$NEW_MESSAGE"
}

create_random_time() {
    minutes=$((RANDOM%2))
    seconds=$((RANDOM%60))
    ms=$((RANDOM%100))
    RANDOM_TIME=${minutes}:${seconds},${ms}
}

send_header_message 1 1
sleep 1

echo stop
send_main_message stop
sleep 4


send_header_message 1 2
sleep 5
# lanes
for i in {1..6}
do
    create_random_time
    send_lane $i 1 2 ${RANDOM_TIME}
done

send_main_message start
sleep 4

# laps
for i in {1..6}
do
create_random_time
send_lane_message $i 1 0 ${RANDOM_TIME} 2
done

sleep 5 

# laps
for i in {1..6}
do
create_random_time
send_lane_message $i 1 $i ${RANDOM_TIME} 2
done