#!/bin/bash

MQTT_HOST=localhost
#MQTT_HOST=rockpi-4b
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
sleep 1
create_random_time
for (( e=1; e<=$NUMBER_EVENTS; e++ ))
do
    send_raw_message clock
    sleep 5
    
    for (( g=1; g<=$NUMBER_HEATS; g++ ))
    do 
        send_raw_message "header $e $g"
        sleep 10
        send_raw_message start
        sleep 10

        # laps
        for (( i=1; i<=$NUMBER_LANES; i++ ))
        do
        create_random_time
        send_raw_message "lane $i ${RANDOM_TIME} 0"
        done

        sleep 5
        # end
        for (( i=1; i<=$NUMBER_LANES; i++ ))
        do
        create_random_time
        send_raw_message "lane $i ${RANDOM_TIME} $i"
        done

        sleep 2
        send_raw_message stop
        sleep 3

    done
done
