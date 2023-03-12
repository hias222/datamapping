# raw data of MQTT
## collect raw data
Topics   
rawdata - data from c prog
mainchannel - data after processing datamapper
error - Error logger

mosquitto_sub -h rockpi-4b -t rawdata >> my-log.txt

## send it again
send_raw_data.sh
Check folder in top section 