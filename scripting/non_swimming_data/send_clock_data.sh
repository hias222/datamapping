#!/bin/bash 

MQTT_HOST=localhost
#MQTT_HOST=192.168.178.152
RAW_TOPIC=mainchannel

send_clock_message(){
    echo main: $1
    NEW_MESSAGE="{\"type\":\"$1\",\"size\":\"large\",\"finishtime\":\"1569662431\"}"
    mosquitto_pub -h $MQTT_HOST -t $RAW_TOPIC -m "$NEW_MESSAGE"
}

#  var jsonvideo = "{ \"type\": \"video\", \"version\": \"" + getEvent(message).toString() + "\", \"time\": \"" + Math.floor(new Date() / 1000) + "\" }"
               
send_video_message(){
    echo video: $1 $2
    NEW_MESSAGE="{\"type\":\"$1\",\"version\":\"$2\",\"finishtime\":\"1569662431\"}"
    mosquitto_pub -h $MQTT_HOST -t $RAW_TOPIC -m "$NEW_MESSAGE"
}

# var jsonmsg = "{ \"type\": \"message\", \"value\": \"" + getMessage(clearMessage) + "\", \"time\": \"" + Math.floor(new Date() / 1000) + "\" }"

send_message(){
    echo message: $1 $2
    NEW_MESSAGE="{\"type\":\"$1\",\"value\":\"$2\"}"
    mosquitto_pub -h $MQTT_HOST -t $RAW_TOPIC -m "$NEW_MESSAGE"
}           

send_header_message(){
    echo header: $1 - $2
    NEW_MESSAGE="{\"event\":\"$1\",\"gender\":\"F\",\"round\":\"$ROUND\",\"relaycount\":\"1\",\"swimstyle\":\"FREE\",\"distance\":\"100\",\"type\":\"header\",\"heat\":\"$2\",\"competition\":\"Meisterschaften 2016\"}"
    mosquitto_pub -h $MQTT_HOST -t $RAW_TOPIC -m "$NEW_MESSAGE"
}

send_clock_message clock

sleep 10
# send_video_message video 1
# sleep 10

send_message message "Schwimmfest \\\n Heute \\\n Beginn \\\n drei"
# send_video_message video 3
