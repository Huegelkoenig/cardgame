const dotenv = require('dotenv');
dotenv.config();
console.log('\x1b[32m%s\x1b[0m','----------- starting new node.js session ------------------------');
const express = require('express');
const http = require('http');
const https = require('https');
const bcrypt = require('bcrypt'); //DELETE: after login is moved to db-users.js

const fs = require('fs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const dbScripts = require('./my_modules/db-scripts/db-scripts');
const Status = require('./my_modules/status/class_status.js');
const cardgame = require('./my_modules/cardgame/cardgame.js');


const jwt = require('jsonwebtoken');
const myJWTsecret = process.env.JWTSECRET;

const PORT = process.env.PORT || 8322;
const HTTPPORT = process.env.HTTPPORT || 8323;
const DOMAIN = process.env.DOMAIN || 'localhost'  //TODO: set DOMAIN variable //TODO: set domain and path for cookies


//---- http server - http.html redirectes to https server ----
const httpApp = express();
const httpServer = http.createServer(httpApp);
httpApp.get('*', (req, res, next) => {
    res.status(200).sendFile(__dirname+'/public/http.html');
});
httpServer.listen(HTTPPORT || 8323,() => {
  console.log(`http listening on port ${HTTPPORT}`);
 });
//------------------------------------------------------------



//---- https server ----------------------------------------
const app = express();
const server = https.createServer(
  {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
  },
  app
);



app.use(express.static(__dirname+'/public'));
app.use('/', cookieParser());
app.use('/', bodyParser.urlencoded({extended:true}));



// if no auth token exists (or is invalid), the login page will be sent. Else, the user will be logged in
app.get('/', (req,res,next) => {
  jwt.verify(req.cookies['cardgameAuthToken'], myJWTsecret, (err, token)=>{
    if (err){ //cardgameAuthToken is invalid, is expired or doesn't exist, user has to login manually
      res.status(200).sendFile(__dirname+'/public/login.html'); 
      return;
    }
    dbScripts.loginResponse(req,res,token);
  });
});

//user wants to see the login page (may existing auth token will be ignored)
app.get('/login', (req,res,next)=>{
  res.status(200).sendFile(__dirname+'/public/login.html');
})

//user submits a login attemp
app.post('/', (req,res,next)=>{
  dbScripts.validateCredentials(req,res); //if credentials are ok, dbScripts.loginResponse(req,res) will be called automatically
})



//user wants to see the recover page
app.get('/recover', (req,res,next)=>{
  res.status(200).sendFile(__dirname+'/public/recover.html');
})

//user submits a recover attemp
app.post('/recover', (req,res,next)=>{
  res.status(200).sendFile(__dirname+'/public/login.html');  //TODO
})



//user wants to see the registration page
app.get('/register', (req,res,next)=>{
  res.status(200).sendFile(__dirname+'/public/register.html');
});

//user submits a registration attemp
app.post('/register', dbScripts.registerUser);



app.get('/hijack', (req,res,next)=>{ //DELETE: just for testing
  res.status(200).sendFile(__dirname+'/_[test]_/hijack.html');  //TODO
})

// any other request to any other path
app.all('*',(req,res,next)=>{res.send(`Oh no, the page you were looking for doesn't exist. Even the 404 page is missing. What's happening???`);}) //TODO:



server.listen(PORT || 8322, () => {
  console.log(`https listening on port ${PORT}`);
 });





/*------- socket.io -----------------------------------------*/
const socketio = require('socket.io');
const io = socketio.listen(server);


io.on('connection', async (socket) => {
  console.log(`a new user connected to SOCKET.IO with sessionID '${socket.handshake.query.sessionID}', username '${socket.handshake.query.username}' and socket.id '${socket.id}'`);
  //disconnect socket immediatelly, if sessionID is invalid (this should only happen if the user deleted his account but still has an authToken or the DB is attacked)
  let sessionIDisValid;
  try{  //used a promise here, since mySQL queries might take some time to respond and cardgame.init() shall not be run, while the sessionID isn't validated
    sessionIDisValid = await dbScripts.validateSessionID(socket);
  }
  catch(err){
    socket.emit('disconnectionMessage', err.usermsg);
    socket.disconnect(true);
    err.log(`logging at server.js at io.on('connection',...), line ${134/*LL*/}`);
    //res.cookie('loginMessage', err.usermsg, {maxAge:1000, sameSite:'Strict', secure:true});
    //res.status(401).sendFile('/public/login.html', {root:__dirname+'/../..'});
    return;
  }
  //socket connection is valid! user can be identified via socket.handshake.query.username
  if (sessionIDisValid){      
    cardgame.init(socket);
  }
  else{
    //this shouldn't happen
    new Status({status:'error', file:'server.js', func: `io.on('connection',...)`, line: 145/*LL*/, date:DateToString(new Date()), msg: `dbScripts.validateSessionID(socket) didn't throw an error, but also didnt resolve true`})
                  .log(`logging at server.js, function io.on('connection',...), line ${146/*LL*/}`);
    socket.emit('disconnectionMessage', `Oups, looks like you found a bug! Error-Code "SER:${147/*LL*/}`);
    socket.disconnect(true);
  }
});