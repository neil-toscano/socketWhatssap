const express = require('express');
const axios = require('axios')
const { createServer } = require('http'); // En lugar de 'node:http', utiliza solo 'http'
const { join } = require('path');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');

const accountSid = 'ACe92ffa9ecaacc792d266fcad65fc0596';
const authToken = '3dd989db6261a9dacdb26ee8778dd3ba';
const client = require('twilio')(accountSid, authToken);
const PORT = process.env.PORT || 3000;
const cors = require('cors'); // Importa el módulo 'cors'

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
const server = createServer(app);


app.use(cors());
let chatbot = true;
const io = new Server(server,{
  cors: {
    origin: "http://localhost:8081", // Cambia esto a tu origen de frontend (Nuxt.js)
    methods: ["GET", "POST"]
  }
});

app.get('/', (req, res) => {
  console.log("hola")
 res.send("hola")
  // res.sendFile(join(__dirname, 'index.html'));
});
app.post('/whatsapp-webhook', async(req, res) => {// Mensage llega de twilio(alguna otra plataforma)

  const messageBody = req.body.Body;
  io.emit("chat message",  messageBody);
  console.log(messageBody)

  //defecto => chatbot
  if(chatbot){
  const respBot =  await enviarMessageChatbot(messageBody);// si dice humano => return humano

  if(respBot.includes("humano")){
     io.emit("chat message", respBot);
     chatbot=false;
  }

  else{
    io.emit("chat message", respBot);
    client.messages
      .create({
          body: `${respBot}`,
          from: 'whatsapp:+14155238886',
          to: 'whatsapp:+51946684130'
      })
      .then(message => console.log(message.sid))
      .catch(error => console.error(error));
  }

  }

});




io.on('connection', (socket) => { //enviamos mensaje a algun chatbot
  io.emit('hello', 'world');
  socket.on('chat message', (msg) => {
    if(msg.includes("bot")){
      chatbot = true;
      return;
    }
    //enviar si llega mensage
    client.messages
    .create({
        body: `${msg}`,
        from: 'whatsapp:+14155238886',
        to: 'whatsapp:+51946684130'
    })
    .then(message => console.log(message.sid))
    .catch(error => console.error(error));
    //emitir a los demas
    io.emit('chat message', msg);
    console.log('message: ' + msg);
  });
});



const enviarMessageChatbot = async(message) => {
  const mensage = {
      message:message
  }

  try {
    const response = await axios.post('http://0.0.0.0:5005/webhooks/rest/webhook',mensage);
    console.log(response.data);
    return response.data[0].text;

  } catch (error) {
    console.log(error);
    return "error"
    
  }
  
}

server.listen(PORT, () => {
  console.log('server running at http://localhost:3000',PORT);
});
