var express = require("express");
var cors = require('cors');
var bodyParser = require("body-parser");
var app = express();
var router = express.Router();
var mqttRawHandler = require('./mqtt/mqtt_handler');
var upload = require('./incoming/upload')
var configuration = require('./data/configuration')
var health = require('./data/health')

require('dotenv').config();

const path = __dirname + '/views/';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors());
app.options('*', cors());

//var messageMapper = new messageMapper();

var mqttRawClient = new mqttRawHandler();
mqttRawClient.connect();

// Routes
router.use(function (req,res,next) {
  console.log('/' + req.method);
  next();
});

router.get('/configuration', configuration)
router.get('/', health);

router.post("/send-mqtt", function(req, res) {
  console.log("Message: " +  JSON.stringify(req.body) )
  mqttRawClient.sendRawMessage(req.body.message)
  var lastMessage = mqttRawClient.getLastMessage();
  res.status(200).send("New Message - last " + lastMessage);
});

app.post('/upload', upload)

app.use(express.static(path));
app.use('/', router);
//app.set('view engine', 'pug');

var HTTP_REST_PORT = typeof process.env.HTTP_REST_PORT !== "undefined" ? process.env.HTTP_REST_PORT : 3001;

var server = app.listen(HTTP_REST_PORT, function () {
    console.log("app running on port.", server.address().port);
});