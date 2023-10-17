require('dotenv').config();
const ServerIo = require('./models/Server');
const server=new ServerIo();

server.listen();