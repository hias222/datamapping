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
sleep 1
create_random_time
     
send_raw_message "header 0 0"
sleep 1

send_raw_message "header 1 2"
sleep 1

send_raw_message start
sleep 4

# laps
for (( i=1; i<=$NUMBER_LANES; i++ ))
do
create_random_time
send_raw_message "lane $i ${RANDOM_TIME} 0"
done

sleep 17

# laps
for (( i=1; i<=$NUMBER_LANES; i++ ))
do
create_random_time
send_raw_message "lane $i ${RANDOM_TIME} $i"
sleep 1
done