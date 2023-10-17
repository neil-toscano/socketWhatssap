const { response } = require("express")
const whatsappToken = process.env.WHATSAPP_TOKEN || 'whatsapptoken';

const authWebHook = (req,res=response) => {
  console.log("token", process.env.WHATSAPP_TOKEN);
  console.log("authWebHook");
    if (
        req.query['hub.mode'] === 'subscribe' &&
        req.query['hub.verify_token'] === whatsappToken
      ) {
        res.send(req.query['hub.challenge']);
      } else {
        res.sendStatus(400);
      }
}


module.exports = {
  authWebHook,
}