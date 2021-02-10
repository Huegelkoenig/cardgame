const dotenv = require('dotenv');
dotenv.config();
console.log('\x1b[32m%s\x1b[0m','----------- starting new node.js session ------------------------');
const express = require('express');
const http = require('http');
const https = require('https');
const bcrypt = require('bcrypt'); //DELETE: after login is moved to db-users.js
const { PerformanceObserver, performance } = require('perf_hooks');

const fs = require('fs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const dbScripts = require('./my_modules/db-scripts/db-scripts.js');
const Status = require('./my_modules/status/class_status.js');
const cardgame = require('./my_modules/cardgame/cardgame.js');
const misc = require('./my_modules/misc/misc.js')



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
  let startTime = performance.now()
  jwt.verify(req.cookies['cardgameAuthToken'], myJWTsecret, (err, token)=>{
    if (err){ //cardgameAuthToken is invalid, is expired or doesn't exist, user has to login manually
      res.status(200).sendFile(__dirname+'/public/login.html');
      return;
    }
    console.log('performance.now()-startTime :>> ', performance.now()-startTime);
    dbScripts.loginResponse(req,res,token);
  });
});

//user wants to see the login page (may existing auth token will be ignored)
app.get('/login', (req,res,next)=>{
  console.log('GET /login')
  res.status(200).sendFile(__dirname+'/public/login.html');
})

//user submits a login attemp
//if credentials are ok, dbScripts.loginResponse(req,res) will be called afterwards
app.post('/', dbScripts.validateCredentials);




//user wants to see the recover page
app.get('/recover', (req,res,next)=>{
  res.status(200).sendFile(__dirname+'/public/recover.html');
})

//user submits a recover attemp
app.post('/recover', dbScripts.recoverCredentials);

//user clicked on the reset link provided by the email sent in dbScripts.recoverCredentials
app.get('/reset/:recoverID', (req,res,next)=>{
  res.cookie('cardgameResetPassword', req.params.recoverID, {
    maxAge: 60*60 * 1000,     // would expire after x seconds  (x * 1000) //now: 60*60 = 1h, equals expiration date of resetID
    httpOnly: true,       // the cookie is only accessible by the web server
    sameSite:'Strict',
    secure: true         // send only via https
    //domain: DOMAIN,    //DEBUG: if domain or path are set, cookies won't work !?!?!?! due to localhost???
    //path: '/'
  });
  res.status(200).sendFile(__dirname+'/public/reset.html')
})


app.post('/reset/:ID',(req,res,next)=>{
  console.log('req.params.ID :>> ', req.params.ID);
  next();
})
app.post('/reset', dbScripts.resetPassword);






//user wants to see the registration page
app.get('/register', (req,res,next)=>{
  res.status(200).sendFile(__dirname+'/public/register.html');
});

//user submits a registration attemp
app.post('/register', dbScripts.registerUser);


//DELETE: just for testing
app.get('/hijack', (req,res,next)=>{
  res.status(200).sendFile(__dirname+'/_[test]_/hijack.html');
})

// any other request to any other path
app.all('*',(req,res,next)=>{res.send(`Oh no, the page you were looking for doesn't exist. Even the 404 page is missing. What's happening???`);}) //TODO:



server.listen(PORT || 8322, () => {
  console.log(`https listening on port ${PORT}`);
 });





/*------- socket.io -----------------------------------------*/
/*------- socket.io -----------------------------------------*/
/*------- socket.io -----------------------------------------*/
const socketio = require('socket.io');
const io = socketio(server, {cookie: false});

//verify user via sessionID BEFORE the 'connection' event
io.use((socket,next)=>{ //this will be executed only once per connection, see https://socket.io/docs/v3/middlewares
  console.log(`${misc.DateToString(new Date())}: Middleware: User '${socket.handshake.query.username}' tries to connect to SOCKET.IO with sessionID '${socket.handshake.query.sessionID}' and socket.id '${socket.id}'`);
  dbScripts.validateSessionID(socket,next);
})

io.on('connection', (socket) => {
  socket.username = socket.handshake.query.username;
  console.log(`the user ${socket.username} connected`);
  socket.emit('del_info');
  socket.on('disconnect', (reason) => {
    console.log(`${misc.DateToString(new Date())}: User ${socket.username} disconnected due to `, reason);
  });
  
  //for testing
  socket.on('click',()=>{console.log(`${socket.username} clicked`)});
  socket.on('key',()=>{console.log(`${socket.username} will be disconnected`); socket.disconnect(true);});

  cardgame.init(socket);
});