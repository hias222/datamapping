#!/bin/bash

#MQTT_HOST=localhost
MQTT_HOST=ubuntu
RAW_TOPIC=rawdata

RANDOM_TIME="1:1,1"

NUMBER_EVENTS=22
NUMBER_HEATS=4
NUMBER_LANES=8

send_raw_message(){
    echo $1
    mosquitto_pub -h $MQTT_HOST -t $RAW_TOPIC -m "$1"
}

create_random_time() {
    minutes=$((RANDOM%2))
    seconds=$((RANDOM%60))
    ms=$((RANDOM%100))
    RANDOM_TIME=${minutes}:${seconds},${ms}
}

send_raw_message clock
send_raw_message stop

send_raw_message "header 1 2"
sleep 15

send_raw_message start
sleep 10

# laps
send_raw_message "lane 4 0:22,71 0"
sleep 1
send_raw_message "lane 5 0:23,71 0"
send_raw_message "lane 3 0:23,88 0"
send_raw_message "lane 6 0:23,96 0"
sleep 2
send_raw_message "lane 2 0:24,21 0"
sleep 3
send_raw_message "lane 1 0:25,11 0"

sleep 10

# end
send_raw_message "lane 4 0:54,71 1"
sleep 1
send_raw_message "lane 5 0:59,71 2"
sleep 2
send_raw_message "lane 3 0:59,88 3"
sleep 1
send_raw_message "lane 6 0:59,96 4"
sleep 1
send_raw_message "lane 2 1:01,21 5"
sleep 5
send_raw_message "lane 1 1:02,21 6"

sleep 3

send_raw_message stop
sleep 5
send_raw_message "header 1 3"

