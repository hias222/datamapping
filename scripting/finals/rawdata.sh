#!/bin/bash

#MQTT_HOST=localhost
MQTT_HOST=rockpie
RAW_TOPIC=rawdata

filename=8_lanes/raw_data_2.txt

send_raw_message(){
    echo $1
    mosquitto_pub -h $MQTT_HOST -t $RAW_TOPIC -m "$1"
}

send_raw_message "stop"
sleep 1
send_raw_message "header 0 0"
sleep 1

# switch to heat
send_raw_message "header 1 3"
sleep 1

# present
send_raw_message "presentlane 2"
sleep 1
send_raw_message "presentlane 1"
sleep 1

send_raw_message "header 1 3"
sleep 1

while read line; do
    # reading each line
    echo "Line No. $n : $line"
    n=$((n+1))
    mosquitto_pub -h $MQTT_HOST -t $RAW_TOPIC -m "$line"
    if [[ "$line" =~ ^time* ]]; then
        sleep 1
    fi
    sleep 1
done < $filename

# reult
send_raw_message best3
sleep 3


