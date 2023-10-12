const accountSid = 'ACe92ffa9ecaacc792d266fcad65fc0596';
const authToken = '3dd989db6261a9dacdb26ee8778dd3ba';
const client = require('twilio')(accountSid, authToken);

client.messages
    .create({
        body: 'Your appointment is coming up on July 21 at 3PM',
        from: 'whatsapp:+14155238886',
        to: 'whatsapp:+51946684130'
    })
    .then(message => console.log(message.sid))
    .catch(error => console.error(error));
