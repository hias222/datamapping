#!/bin/bash

#MQTT_HOST=localhost
MQTT_HOST=rockpie
RAW_TOPIC=rawdata

send_raw_message(){
    echo $1
    mosquitto_pub -h $MQTT_HOST -t $RAW_TOPIC -m "$1"
}

send_raw_message best3
sleep 3
send_raw_message "presentlane 2"

