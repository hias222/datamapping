# datmapping

Get MQTT Data and add user data

## configure

* npm install
* check .env file out of example.env
* add number of lanes in env file


## Start

```bash
node app.js
```

## Create Docker container

```bash
docker build -t hias222/datamapping .
docker run --name datamapping -p 80:8080 -d hias222/datamapping
```

## Start MQTT for test

### Mosquito Folder

```bash
docker run -d -p 1883:1883 -p 9001:9001 -v $(pwd)/mosquitto.conf:/mosqtto/config/mosquitto.conf -v /mosquitto/data -v $(pwd)/log:/mosquitto/log eclipse-mosquitto
```

## Sample Data

```bash
start
lane 2 00:25,00 2 
lane 3 00:27,19 0 
lane 1 00:22,69 1 
lane 6 00:29,43 4 
lane 3 00:27,19 3 
lane 8 00:37,06 6 
header 001 002
lane 5 00:34,92 5 
lane 4 00:42,09 0 
lane 4 00:42,09 7 
header 001 003
start
lane 6 00:21,35 1 
lane 7 00:24,77 3 
lane 8 00:23,08 2 
header 001 003
lane 5 00:28,81 5 
lane 1 00:27,03 4 
lane 2 00:33,25 0 
lane 4 00:39,31 8 
lane 2 00:33,25 6 
lane 3 00:35,61 7 
```

## ToDOs

* at AWS core connection
