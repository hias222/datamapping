const MQTT = require('MQTT');

const AWS = require('aws-iot-device-sdk/device')

/*
node node_modules/aws-iot-device-sdk/examples/device-example.js 
--host-name=a101aihtfyydn6-ats.iot.eu-central-1.amazonaws.com 
--private-key=colorado.private.key 
--client-certificate=colorado.cert.pem 
--ca-certificate=root-CA.crt 
--client-id=sdk-nodejs-d9122ba1-c0df-4470-a82f-6cd8b7c04e21
*/

const connect = { MQTT, AWS };

module.exports = {
    createConnect(type, MQTTdestination, settings) {
        const ConnectType = connect[type];
        //MQTT.connect(attributes)
        console.log('<connectFactory> attributes: ')
        console.log(MQTTdestination)
        console.log(settings)
        if (type === 'AWS') {
            const AWSDevice = ConnectType({
                host: 'a101aihtfyydn6-ats.iot.eu-central-1.amazonaws.com',
                keyPath: 'aws/colorado.private.key',
                certPath: 'aws/colorado.cert.pem',
                caPath: 'aws/root-CA.crt',
                clientId: 'sdk-nodejs-d9122ba1-c0df-4470-a82f-6cd8b7c04e21',
                debug: true
                /*
                keyPath: args.privateKey,
                certPath: args.clientCert,
                caPath: args.caCert,
                clientId: args.clientId,
                region: args.region,
                baseReconnectTimeMs: args.baseReconnectTimeMs,
                keepalive: args.keepAlive,
                protocol: args.Protocol,
                port: args.Port,
                host: args.Host,
                debug: args.Debug
                */
            });
            //AWSDevice.subscribe(MQTTtopic)
            return AWSDevice
        } else {
            return ConnectType.connect(MQTTdestination, settings)
        }

    }
};