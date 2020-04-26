const dotenv = require('dotenv');
dotenv.config();
const express = require('express');

const http = require('http');
const https = require('https');

const fs = require('fs');

const PORT = process.env.PORT || 8322;
const HTTPPORT = process.env.HTTPPORT || 8323;

httpApp = express();
const httpServer = http.createServer(httpApp);
httpApp.get("*", function (req, res, next) {
  console.log('req.headers.host :>> ', req.headers.host);
    res.status(200).sendFile(__dirname+'/public/http.html');
});
httpServer.listen(HTTPPORT || 8323,() => {
  console.log(`http listening on port ${HTTPPORT}`);
 });



const app = express();
const server = https.createServer(
  {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
  },
  app
);

app.use(express.static(__dirname+'/public'));
app.get('/', (req,res) => res.status(200).sendFile('index.html')); 

server.listen(PORT || 8322, () => {
  console.log(`https listening on port ${PORT}`);
 });

const socketio = require('socket.io');
const io = socketio.listen(server);


io.use((socket, next) => {
  let username = socket.handshake.query.username;
  let password = socket.handshake.query.username;
  console.log(`new user '${username}' tries to connect with password '${socket.handshake.query.password}'`);
  if (checkformat(username) && checkformat(password)){
    if (checkUserCredentialsInDatabase(username,password)){
      return next();
    }
    else{
      return next(new Error('userAndPassDontMatch'));
    }
  }
  else{
    return next(new Error('formatInvalid'));
  }
});


function checkUserCredentialsInDatabase(username, password){
  //TODO:
  //hash password and salt with secret etc and check if they match
  return true;
}

function checkformat(string){
  //TODO:
  //check format of string (not undefined, length, no spaces, unallowed signs like || or && etc... ), prevent sqlinjects, etc
  //see also: connection = mysql.createConnection(...);
  //          var sql = "SELECT ... WHERE username = " + connection.escape(username);
  // or     : var userID = 5;
  //          var query = connection.query('SELECT * FROM users WHERE id = ?', [userId],
  // or     : post  = {id: 1, title: 'Hello MySQL'};
  //          var query = connection.query('INSERT INTO posts SET ?', post, function(err, result) {
  // OR: : :  with MySQL2; .execute() !!!
  return true;
}



io.on('connection', (socket) => {
  console.log(`'${socket.handshake.query.username}' connected with password '${socket.handshake.query.password}`);
});





//////////////////////////////////////////////////////////////////////////////////


let allnames = {};
let openGames = {}; 


