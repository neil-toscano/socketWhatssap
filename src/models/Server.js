const express=require('express');

const cors=require('cors');
const bodyParser = require('body-parser');

const { join } = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');

const {enviarMessageWhatsapp, enviarMessageChatbot} = require('../controllers/whatsapp/messages');
const { callSendAPI } = require('../controllers/messenger/messages');

class ServerIo{

    constructor(){
        this.app=express();
        this.server = createServer(this.app);
        this.middlewares();
        this.io = new Server(this.server);
        this.socketIo();
        this.routes();
        this.chatbot = false;
        this.social_network = "whatsapp";
    }

    middlewares(){
        //Directorio publico
        this.app.use(express.static('public'));
        this.app.use(express.json());
        this.app.use(bodyParser.json());
        this.app.use(cors());
    }

    socketIo(){
        this.io.on('connection', (socket) => {
            this.io.emit('chat message', 'conectado nuevo usuario');
            socket.on('chat message', (msg) => {
                const response ={
                    text:msg
                }
                if(msg.includes("bot")){
                  this.chatbot = false;
                  return;
                }
                if(this.social_network == "whatsapp"){
                    enviarMessageWhatsapp(msg);
                }
                else if(this.social_network == "messenger"){
                    callSendAPI('24087937074155627',response);
                }
                this.io.emit('chat message', msg);
              });
          });
    }

    routes(){
       this.app.get('/api',(req,res) => { 
            res.sendFile(join(__dirname, '../public/index.html'));
       });

       this.app.use('/api/whatsapp/webhook', require("../routes/authWhatsapp")); //Get check => Whatsapp
       this.app.use('/api/messenger/webhook', require("../routes/authMessenger"));//Messenger

       this.app.post('/api/whatsapp/webhook',async(req,res=express.response)=>{ //for Whatsapp
            let value= null;
            try {
              value = req.body.entry[0]?.changes[0]?.value?.messages[0]?.text?.body || null;
              console.log(JSON.stringify(req.body));
              
            } catch (error) {
            //   console.log(JSON.stringify(req.body));
              value = null;
              return ;
            }
            this.io.emit("chat message",JSON.stringify(value));
            if(this.chatbot){
              const respBot =  await enviarMessageChatbot(value);
              console.log({"respbot":respBot});
              if(respBot.includes("humano")){
                 this.io.emit("chat message", respBot);
                 this.chatbot=false;
              }
            
              else{
                this.io.emit("chat message", respBot);
                enviarMessageWhatsapp(respBot);
              }
              }
            res.sendStatus(200);        
       });
       this.app.post('/api/messenger/webhook',(req, res=express.response) => {// for Messenger
            const self = this;
            let body = req.body; 
            if (body.object === 'page') {
                    let webhookEvent = body.entry[0].messaging[0];
                    console.log(webhookEvent);
                    self.io.emit("chat message",webhookEvent.message.text);
                    let senderPsid = webhookEvent.sender.id;
                    console.log('Sender PSID: ' + senderPsid);
                    res.status(200).send('EVENT_RECEIVED');
            } else {
                res.sendStatus(404);
            }
       })
    }

    listen(){
        this.server.listen(process.env.PORT,()=>{
            console.log(`Servidor corriendo en el puerto ${process.env.PORT}`);
        });
    }
}
module.exports=ServerIo;