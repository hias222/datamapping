const Mqtt = require('mqtt');

const connect = { Mqtt};

module.exports = {
    createConnect(type, mqttdestination, settings) {
        const ConnectType = connect[type];
        //Mqtt.connect(attributes)
        console.log('attributes: ')
        console.log(mqttdestination)
        console.log(settings)
        
        return ConnectType.connect(mqttdestination,settings)
    }
};