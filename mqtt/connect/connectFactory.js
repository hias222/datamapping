const MQTT = require('mqtt');
require('dotenv').config()

const AWS = require('aws-iot-device-sdk-v2/')

var mqttaws_host= typeof process.env.DST_AWS_HOST !== "undefined" ? process.env.DST_AWS_HOST : 'a101aihtfyydn6-ats.iot.eu-central-1.amazonaws.com';
var mqttaws_keypath= typeof process.env.DST_AWS_KEYPATH !== "undefined" ? process.env.DST_AWS_KEYPATH : 'aws/colorado.private.key';
var mqttaws_certpath= typeof process.env.DST_AWS_CERTPATH !== "undefined" ? process.env.DST_AWS_CERTPATH: 'aws/colorado.cert.pem';
var mqttaws_capath= typeof process.env.DST_AWS_CAPATH !== "undefined" ? process.env.DST_AWS_CAPATH: 'aws/root-CA.crt';
var mqttaws_clientid= typeof process.env.DST_AWS_CLIENTID !== "undefined" ? process.env.DST_AWS_CLIENTID: 'sdk-nodejs-d9122ba1-c0df-4470-a82f-6cd8b7c04e21';

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
    createConnect(type, mqttdestination, settings) {
        const ConnectType = connect[type];
        //Mqtt.connect(attributes)
        console.log('<connectFactory> attributes: ')
        console.log(mqttdestination)
        console.log(settings)
        if (type === 'AWS') {
            const AWSDevice = ConnectType({
                host: mqttaws_host,
                keyPath: mqttaws_keypath,
                certPath: mqttaws_certpath,
                caPath: mqttaws_capath,
                clientId: mqttaws_clientid,
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
            //AWSDevice.subscribe(mqtttopic)
            return AWSDevice
        } else {
            return ConnectType.connect(mqttdestination, settings)
        }

    }
};