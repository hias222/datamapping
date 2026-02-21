
const MQTT = require('mqtt');
require('dotenv').config();

const {
    mqtt,
    io,
    iot,
    iotidentity,
    iotjobs,
    iotshadow,
    mqtt5
} = require('aws-iot-device-sdk-v2');


var mqttaws_host = process.env.DST_AWS_HOST || 'a101aihtfyydn6-ats.iot.eu-central-1.amazonaws.com';
var mqttaws_keypath = process.env.DST_AWS_KEYPATH || 'aws/colorado.private.key';
var mqttaws_certpath = process.env.DST_AWS_CERTPATH || 'aws/colorado.cert.pem';
var mqttaws_capath = process.env.DST_AWS_CAPATH || 'aws/root-CA.crt';
var mqttaws_clientid = process.env.DST_AWS_CLIENTID || 'sdk-nodejs-d9122ba1-c0df-4470-a82f-6cd8b7c04e21';

/*
node node_modules/aws-iot-device-sdk/examples/device-example.js 
--host-name=a101aihtfyydn6-ats.iot.eu-central-1.amazonaws.com 
--private-key=colorado.private.key 
--client-certificate=colorado.cert.pem 
--ca-certificate=root-CA.crt 
--client-id=sdk-nodejs-d9122ba1-c0df-4470-a82f-6cd8b7c04e21
*/


module.exports = {
    createConnect(type, mqttdestination, settings) {
        if (type === 'AWS') {
            // AWS IoT Device SDK v2 connection
            console.log("==== Creating AWS MQTT5 Client ====\n");
            //const clientBootstrap = new io.ClientBootstrap();
            console.log("==== configBuilder ====\n");
            const configBuilder = iot.AwsIotMqtt5ClientConfigBuilder.newDirectMqttBuilderWithMtlsFromPath(
                mqttaws_host,
                mqttaws_certpath,
                mqttaws_keypath
            );

            //configBuilder.with_certificate_authority_from_path(mqttaws_capath);
            //configBuilder.with_clean_session(true);
            //configBuilder.with_client_id(mqttaws_clientid);
            //configBuilder.with_endpoint(mqttaws_host);
            configBuilder.withConnectProperties({
                clientId: mqttaws_clientid,
                keepAliveIntervalSeconds: 1200
            });

            const config = configBuilder.build();
            const mqttClient = new mqtt5.Mqtt5Client(config);

            //const connection = mqttClient.new_connection(config);

            // Return the connection object; user must call .connect() and handle promises
            return mqttClient;
        } else if (type === 'MQTT') {
            console.log("==== Creating MQTT Client ====\n");
            return MQTT.connect(mqttdestination, settings);
        }
    }
};