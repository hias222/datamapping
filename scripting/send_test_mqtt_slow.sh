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

send_main_message clock
sleep 1
create_random_time
for (( e=1; e<=$NUMBER_EVENTS; e++ ))
do
    
    for (( g=1; g<=$NUMBER_HEATS; g++ ))
    do 
        send_header_message $e $g
        sleep 5
        send_main_message start
        sleep 4

        # laps
        create_random_time
        send_lane_message 4 $e 0 ${RANDOM_TIME} $g
        create_random_time
        sleep 1
        send_lane_message 2 $e 0 ${RANDOM_TIME} $g
        create_random_time
        send_lane_message 3 $e 0 ${RANDOM_TIME} $g
        sleep 3
        create_random_time
        send_lane_message 5 $e 0 ${RANDOM_TIME} $g
        create_random_time
        send_lane_message 1 $e 0 ${RANDOM_TIME} $g
        sleep 5
        create_random_time
        send_lane_message 6 $e 0 ${RANDOM_TIME} $g

       
        sleep 20
        # end
        create_random_time
        send_lane_message 4 $e 1 ${RANDOM_TIME} $g
        create_random_time
        sleep 1
        send_lane_message 2 $e 2 ${RANDOM_TIME} $g
        create_random_time
        send_lane_message 3 $e 3 ${RANDOM_TIME} $g
        sleep 3
        create_random_time
        send_lane_message 5 $e 4 ${RANDOM_TIME} $g
        create_random_time
        send_lane_message 1 $e 5 ${RANDOM_TIME} $g
        sleep 5
        create_random_time
        send_lane_message 6 $e 6 ${RANDOM_TIME} $g

        sleep 2
        send_main_message stop
        sleep 3

    done
done
