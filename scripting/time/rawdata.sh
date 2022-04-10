#!/bin/bash

#MQTT_HOST=localhost
MQTT_HOST=ubuntu
RAW_TOPIC=rawdata

TIME=0
NUMBER_TIME_MAX=10000

send_raw_message(){
    echo $1
    mosquitto_pub -h $MQTT_HOST -t $RAW_TOPIC -m "$1"
}

send_raw_message clock
send_raw_message stop
sleep 1
send_raw_message start

sleep 1


# laps
for (( i=1; i<=$NUMBER_TIME_MAX; i++ ))
do
send_raw_message "time $i "
sleep 2
done
