'use strict'
const dotenv = require('dotenv');
dotenv.config();
console.log('\x1b[32m%s\x1b[0m','----------- starting new node.js session ------------------------');
const express = require('express');
const http = require('http');
const https = require('https');
const bcrypt = require('bcrypt'); //DELETE: after login is moved to db-users.js
const { PerformanceObserver, performance } = require('perf_hooks'); //TODO: just needed for testing

const fs = require('fs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const dbScripts = require('./my_modules/db-scripts/db-scripts.js');
const Status = require('./my_modules/status/class_status.js');
const cardgame = require('./my_modules/cardgame/cardgame.js');
const misc = require('./my_modules/misc/misc.js');

const jwt = require('jsonwebtoken');
const myJWTsecret = process.env.JWTSECRET;

const HTTPSPORT = process.env.HTTPSPORT || 8322;
const HTTPPORT = process.env.HTTPPORT || 8323;
//const DOMAIN = process.env.DOMAIN || 'localhost'  //TODO: set DOMAIN variable //TODO: set domain and path for cookies



/*------ http server ----------------------------------------*/
/*------ http server - http.html redirectes to https server--*/
/*------ http server ----------------------------------------*/
const httpApp = express();
const httpServer = http.createServer(httpApp);
httpApp.get('*', (req, res, next) => {
    console.log('HTTP GET');
    res.status(200).sendFile(__dirname+'/private/http.html');
});
/*--httpServer.on('error', (e) => {
  //if (e.code === 'EADDRINUSE') {
    console.error('Address in use, retrying...');
    setTimeout(() => {
      httpServer.close();
      httpServer.listen({port: HTTPPORT, host: acthost});
    }, 1000);
 // }
}); --*/
httpServer.listen({port:HTTPPORT}, (err) => {
  if(err){
    console.log(err);
    console.log(`error while trying to listen on http-port ${HTTPPORT}`);
    return;
  }
  console.log(`http listening on port ${HTTPPORT}`);
 });
/*------ end of http server ---------------------------------*/
/*------ end of http server ---------------------------------*/
/*------ end of http server ---------------------------------*/





/*----------- https server ----------------------------------*/
/*----------- https server ----------------------------------*/
/*----------- https server ----------------------------------*/
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


app.get('/', (req,res,next) => {
  res.status(200).sendFile(__dirname+'/private/app.html');
});



//user submits a login attemp
//if credentials are ok, either dbScripts.loginResponse(req,res) will be called afterwards
//app.post('/', dbScripts.validateCredentials, loginResponse);
app.post('/auth', (req,res)=>{
  jwt.verify(req.cookies['cardgameAuthToken'], myJWTsecret, (err, token)=>{
    if (err){ //authToken doesn't exist, is invalid, or expired. User has to login
      console.log('authToken doesnt exist or is invalid');
      res.set('WWW-Authenticate', 'FormBased');
      res.status(401).send(JSON.stringify({view:'loginView', msg:''}));
      return;
    }
    dbScripts.loginResponse(req,res,token); 
  });
});


app.post('/login', dbScripts.validateCredentials);



//user submits a recover attemp
app.post('/recover', dbScripts.recoverCredentials);

//user clicked on the reset link provided by the email sent in dbScripts.recoverCredentials
app.get('/reset/:recoverID', (req,res,next)=>{
  res.status(200).sendFile(__dirname+'/private/resetpassword.html');   
});



app.post('/reset/:ID', dbScripts.resetPassword);


//user submits a registration attemp
app.post('/register', dbScripts.registerUser);


app.get('/image/:imageName', (req,res)=>{
  res.status(200).sendFile(__dirname+'/private/graphics/'+req.params.imageName+'.png');
});


// any other request to any other path
app.all('*',(req,res,next)=>{
  console.log('app.all ');
  console.table(req.params)
  res.status(404).sendFile(__dirname+'/private/404.html');
});

//const localhost = 'localhost';  //  server.listen(PORT, HOST, ()=>{...}) 
//const hostname = '0.0.0.0';
//const hostall = '*';
//const acthost = HOST;
const HOST = process.env.HOST; 
server.listen(HTTPSPORT, () => {
  console.log(`https listening on port ${HTTPSPORT}` ); //on host ${acthost}`);
 });

/*---- end of https server ----------------------------------*/
/*---- end of https server ----------------------------------*/
/*---- end of https server ----------------------------------*/



/*------- socket.io -----------------------------------------*/
/*------- socket.io -----------------------------------------*/
/*------- socket.io -----------------------------------------*/
const socketio = require('socket.io');
const io = socketio(server, {cookie: false});

//verify user via sessionID BEFORE the 'connection' event
io.use((socket,next)=>{ //this will be executed only once per connection, see https://socket.io/docs/v3/middlewares
  console.log(`${misc.DateToString(new Date())}: MyMiddleware: User '${socket.handshake.query.username}' tries to connect to SOCKET.IO with sessionID '${socket.handshake.query.sessionID}' and socket.id '${socket.id}'`);
  let possibleError = dbScripts.validateSessionID(socket);  //if possibleError is an Error-Object, next() will NOT be called. Instead, an "connect_error"-Event will be emitted to the client
  next(possibleError);
});

io.on('connection', (socket) => {
  console.log('io.on("connection")');
  socket.username = socket.handshake.query.username;

  cardgame.initGame(socket);

  socket.on('disconnect', (reason) => {
    console.log(`${misc.DateToString(new Date())}: User ${socket.username} disconnected due to `, reason);
  });
});