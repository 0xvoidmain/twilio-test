const http = require('http');
const express = require('express');
const ClientCapability = require('twilio').jwt.ClientCapability;
const VoiceResponse = require('twilio').twiml.VoiceResponse;
var bodyParser = require('body-parser');

const config = require('config');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('./public'));

app.get('/token', (req, res) => {
  const accountSid = config.get('account_sid');
  const authToken = config.get('account_auth_token');
  const appSid = config.get('app_sid');

  const capability = new ClientCapability({
    accountSid: accountSid,
    authToken: authToken,
  });
  capability.addScope(
    new ClientCapability.OutgoingClientScope({ applicationSid: appSid })
  );
  capability.addScope(new ClientCapability.IncomingClientScope('joey'));
  const token = capability.toJwt();

  res.set('Content-Type', 'application/jwt');
  res.send(token);
});

app.post('/voice', (req, res) => {
  var phoneNumber = req.body.phoneNumber;
  var callerId = config.get('phone_number');
  var twiml = new VoiceResponse();

  var dial = twiml.dial({callerId : callerId});
  if (phoneNumber != null) {
    dial.number(phoneNumber);
  } else {
    dial.client("support_agent");
  }

  res.send(twiml.toString());
});

http.createServer(app).listen(3000);
console.log('Twilio Client app server running at port: 3000');
