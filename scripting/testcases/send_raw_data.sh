#!/bin/bash 

MQTT_HOST=rockpi-4b
#MQTT_HOST=192.168.178.152
RAW_TOPIC=rawdata
filename=8_lanes/raw_data_1.txt
n=1

while read line; do
    # reading each line
    echo "Line No. $n : $line"
    n=$((n+1))
    mosquitto_pub -h $MQTT_HOST -t $RAW_TOPIC -m "$line"
    if [[ "$line" =~ ^time* ]]; then
        sleep 2
    fi
    sleep 1
done < $filename