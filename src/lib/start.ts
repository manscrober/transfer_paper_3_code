import app from './app';
import * as https from 'https'
const port = 3000;
app.set("trust proxy",true)
const fs = require('fs');
var key = fs.readFileSync(__dirname + '/../../../certs/selfsigned.key');
var cert = fs.readFileSync(__dirname + '/../../../certs/selfsigned.crt');
var options = {
  key: key,
  cert: cert
};

var server = https.createServer(options, app);

server.listen(port, () => {
  console.log("server starting on port : " + port)
});