const axios = require('axios');

const enviarMessageWhatsapp = async(message) => {

    const headers = {
      'Authorization': `Bearer ${process.env.PAGE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    };
    const mensage = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: "51946684130",
      type: "text",
      text: { 
        preview_url: false,
        body: message
        }
    }
  
    try {
      const response = await axios.post('https://graph.facebook.com/v18.0/141303815734317/messages',mensage,{headers});
    //   console.log(response.data);
    } catch (error) {
    // console.log("ERROR",error);
      return "error" 
    }
    
  }

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

  module.exports = {
    enviarMessageChatbot,
    enviarMessageWhatsapp
  }