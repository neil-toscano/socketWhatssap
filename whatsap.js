const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');

const app = express();

const xhub = require('express-x-hub');

app.use(cors());
// app.use(xhub({ algorithm: 'sha1', secret: process.env.APP_SECRET }));
// app.use(bodyParser.json());

// Establece el token de verificación de WhatsApp
const whatsappToken = process.env.WHATSAPP_TOKEN || 'whatsapptoken';
const receivedUpdates = [];

app.get('/', function(req, res) {
    console.log("hello");
  res.send('<pre>' + JSON.stringify(receivedUpdates, null, 2) + '</pre>');
});

app.get('/webhooks', function(req, res) {
    console.log(req.query);
    console.log("hello, neil")
  if (
    req.query['hub.mode'] === 'subscribe' &&
    req.query['hub.verify_token'] === whatsappToken
  ) {
    res.send(req.query['hub.challenge']);
  } else {
    res.sendStatus(400);
  }
});

app.post('/whatsapp', function(req, res) {
  console.log('WhatsApp request body:', req.body);

  if (!req.isXHubValid()) {
    console.log('Warning - request header X-Hub-Signature not present or invalid');
    res.sendStatus(401);
    return;
  }

  console.log('Request header X-Hub-Signature validated');
  // Procesa los eventos de WhatsApp aquí
  receivedUpdates.unshift(req.body);
  res.sendStatus(200);
});

app.listen(3000,()=>console.log("ejecutandose puerto 3000"));
