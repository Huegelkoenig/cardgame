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

const jwt = require('jsonwebtoken');
const myJWTsecret = process.env.JWTSECRET;

const PORT = process.env.PORT || 8322;
const HTTPPORT = process.env.HTTPPORT || 8323;
const DOMAIN = process.env.DOMAIN || localhost  //TODO: set DOMAIN variable


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

var count=0;

app.use(express.static(__dirname+'/public'));
app.use('/', cookieParser());
app.use('/', bodyParser.urlencoded({extended:true}));

// if no auth token exists (or is invalid), the login page will be sent. Else, the user will be logged
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
app.post('/login', (req,res,next)=>{
  dbScripts.validateCredentials(req,res);
})


// app.post('/', async (req,res) => {
//   console.log('received POST / request');
//   if (validateAuthToken(req)) {
//     //this appears, when the game.html sends the xhttp-request
//     console.log('POST with valid cookie');
//     // TODO: get personal login-id from mysql-table users, that gets created on login and is only limited for a certain amount of time
//     // TODO: write new routine that overwrites these login id's after a certain amount of time after the last login
//     // (setTimeout is bad, since a new login could have happened, maybe: settimeout, but check for last logindate first (must be saved into userstable, too)
//     let rand = Math.random(); //TODO: replace: create sessionID, store it in DB
//     console.log('rand :>> ', rand);
//       res.status(200).send({sessionID: rand, token: req.cookies['cardgameAuthToken']}); //TODO: replace with sessionID and username
//       // game.html will start a socket.io connection with this sessionID
//   }
//   else{
//     console.log('POST without valid cookie');
//     // no cookie was set before, so this must be an login attemp
//     console.log('User wants to log in. Checking Username and password');
//     let credentialsValid;
//     try{
//       credentialsValid = await validateCredentials(req);
//     }
//     catch (err){
//       if (err instanceof Status){
//         err.log(`logging at server.js, app.post('/',...), line ${106/*LL*/}`);
//         res.cookie('loginMessage', err.usermsg||err.usermessage||err.msg||err.message + '', {maxAge:1000, sameSite:'Strict', secure:true});
//         res.status(401).sendFile(__dirname+'/public/login.html');
//         return;
//       }
//       else{
//         console.log(`unexpected error at\n\tserver.js\n\tapp.post('/',...), line ${112/*LL*/}\n\terror:`, err);
//         res.cookie('loginMessage', 'Oups, something went wrong. Cant validate your credentials.', {maxAge:1000, sameSite:'Strict', secure:true});
//         res.status(401).sendFile(__dirname+'/public/login.html');
//         return;
//       }
//     }
//     console.log('credentialsValid line ' + 118/*LL*/ + ' :>> ', credentialsValid);
//     if (credentialsValid){
//       //login succesfull
//       let token;
//       token = jwt.sign({username: req.body.loginusername}, myJWTsecret);
//       res.cookie('cardgameAuthToken', token, {
//         maxAge: 3 * 1000, // expires after x seconds  (x*1000)
//         httpOnly: true, // the cookie is only accessible by the web server
//         sameSite:'Strict',
//         secure: true, // send only via https
//         domain: DOMAIN,
//         path: '/'
//       });
//       res.status(200).sendFile(__dirname + '/private/game.html');
//       return;
//     }
//     else{
//       console.log({error: 'not succesful. Wrong username or password'});
//       res.cookie('loginMessage', 'login failed: wrong username or password', {maxAge:1000, sameSite:'Strict', secure:true});
//       res.status(401).sendFile(__dirname+'/public/login.html');
//       return;
//       //res.status(401).sendFile(__dirname + '/public/index.html', {headers: {'x-sent': true}});  //sends loginFile again
//     }
//   }
// });


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



// any other request to any other path
app.all('*',(req,res,next)=>{res.send('404 page is missing, but will be here soon');})











server.listen(PORT || 8322, () => {
  console.log(`https listening on port ${PORT}`);
 });









const socketio = require('socket.io');
const io = socketio.listen(server);


io.use((socket, next) => {
  console.log('io.use :>> ');
  socket.handshake.query.token = socket.handshake.query.token==='undefined'?undefined:socket.handshake.query.token;
  if (socket.handshake.query.token){
    console.log('241/*LL*/socket.handshake.query.token :>> ', socket.handshake.query.token);
    try{
      socket.username = jwt.verify(socket.handshake.query.token, myJWTsecret).username;
    }
    catch(err){//TODO:
      console.log('ERROR at io.use() jwt.verify(socket.handshake.query.token, myJWTsecret) :>> ', err);
      socket.emit('error',err);
    }    
  }  
  next();
});


function checkUserCredentialsInDatabase(username, password){
  console.trace('hh');
  //TODO:
  //hash password and salt with secret etc and check if they match
  return true;
}




io.on('connection', (socket) => {
  console.log('startDDos :>> ');
  socket.emit('startDDoS');
  let count=0;
  console.log(`a new user connected to SOCKET.IO with userID '${socket.handshake.query.sessionID}', username '${socket.username}' and socket.id '${socket.id}'`);
  //TODO: store socket.id in mySQL table next to user with sessionID, so this user is identified 
  //maybe: socket.username = SELECT userName FROM users WHERE sessionID = pool.escape(socket.handshake.query.sessionID);
  //may do this in a io.use((socket,next)=>{})
  socket.on('testDDoS',()=>{
                            count++;
                            if (count%1000==0){
                              console.log('DDoS status :>> ', count);
                            };
                          });
});





//////////////////////////////////////////////////////////////////////////////////