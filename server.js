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
const DOMAIN = process.env.DOMAIN || localhost


//---- http server - http.html redirectes to https server ----
const httpApp = express();
const httpServer = http.createServer(httpApp);
httpApp.get("*", (req, res, next) => {
    res.status(200).sendFile(__dirname+'/public/http.html');
});
httpServer.listen(HTTPPORT || 8323,() => {
  console.log(`http listening on port ${HTTPPORT}`);
 });


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

app.get('/', (req,res,next) => {
  if (validateCookieToken(req)){
    //set cookie again to extend expiration date
    res.cookie('myAuthToken', req.cookies.myAuthToken, {
      maxAge: 3 * 1000, // would expire after x seconds  (x * 1000)
      httpOnly: true, // The cookie is only accessible by the web server
      sameSite:'Strict',
      secure: true, // send only via https
      domain: DOMAIN,  //TODO
      path: '/'
    });
    res.status(200).sendFile(__dirname + '/private/game.html'); //TODO:
    return;
  }  
  else{
  // no cookie => no authorization => need to login on index.html
    console.log('GET without valid cookie');
    res.status(200).sendFile(__dirname+'/public/login.html');  //sends loginFile
    return;
  }
});


app.get('/register',(req,res)=>{
  res.status(200).sendFile(__dirname+'/public/register.html');
  return;
});


app.post('/', async (req,res) => {
  console.log('received POST / request');
  if (validateCookieToken(req)) {
    //this appears, when the game.html sends the xhttp-request
    console.log('POST with valid cookie');
    // TODO: get personal login-id from mysql-table users, that gets created on login and is only limited for a certain amount of time
    // TODO: write new routine that overwrites these login id's after a certain amount of time after the last login
    // (setTimeout is bad, since a new login could have happened, maybe: settimeout, but check for last logindate first (must be saved into userstable, too)
    let rand = Math.random(); //TODO: replace with sessionID
    console.log('rand :>> ', rand);
      res.status(200).send({sessionID: rand, token: req.cookies['myAuthToken']}); //TODO: replace with just sessionID
      //i think i really need to send the token here again, or else someone could just bruteforce socket-connections with random sessionID's
      //maybe hash token again before sending it to the user?
      // game.html will start a socket.io connection with this sessionID (and token)
  }
  else{
    console.log('POST without valid cookie');
    // no cookie was set before, so this must be an login attemp
    console.log('User wants to log in. Checking Username and password');
    let credentialsValid;
    try{
      credentialsValid = await validateCredentials(req);
    }
    catch (err){
      if (err instanceof Status){
        err.log(`logging at server.js, app.post('/',...), line ${102/*LL*/}`);
        res.cookie('loginmessage', err.usermsg||err.usermessage||err.msg||err.message + '', {maxAge:1000, sameSite:'Strict', secure:true});
        res.status(401).sendFile(__dirname+'/public/login.html');
        return;
      }
      else{
        console.log(`unexpected error at\n\tserver.js\n\tapp.post('/',...), line ${108/*LL*/}\n\terror:`, err);
        res.cookie('loginmessage', 'Oups, something went wrong. Cant validate your credentials.', {maxAge:1000, sameSite:'Strict', secure:true});
        res.status(401).sendFile(__dirname+'/public/login.html');
        return;
      }
    }
    console.log('credentialsValid line ' + 114/*LL*/ + ' :>> ', credentialsValid);
    if (credentialsValid){
      //login succesfull
      let token;
      token = jwt.sign({username: req.body.loginusername}, myJWTsecret);
      res.cookie('myAuthToken', token, {
        maxAge: 3 * 1000, // expires after x seconds  (x*1000)
        httpOnly: true, // the cookie is only accessible by the web server
        sameSite:'Strict',
        secure: true, // send only via https
        domain: DOMAIN,
        path: '/'
      });
      res.status(200).sendFile(__dirname + '/private/game.html');
      return;
    }
    else{
      console.log({error: 'not succesful. Wrong username or password'});
      res.cookie('loginmessage', 'login failed: wrong username or password', {maxAge:1000, sameSite:'Strict', secure:true});
      res.status(401).sendFile(__dirname+'/public/login.html');
      return;
      //res.status(401).sendFile(__dirname + '/public/index.html', {headers: {'x-sent': true}});  //sends loginFile again
    }
  }
});



app.post('/register', dbScripts.registerUser);



function validateCookieToken(req){
  if (req.cookies['myAuthToken']){
    console.log('cookieToken vorhanden:');
    let token;
    try{
      token = jwt.verify(req.cookies['myAuthToken'], myJWTsecret)
    }
    catch (error){
      //jwt invalid => no authorization => need to login on index.html
      console.log('error in function validateCookieToken(req): ', error);
      return false;
    }
    //no error => cookie exists and jwt is valid
    console.log('token: ',token) //TODO:
    return true;
  }
  else{
    console.log('(cookieToken nicht vorhanden, daher)');
    return false;
  }
}

function validateCredentials(req){
  return new Promise(async (resolve,reject)=>{
    if (req.body.loginusername && req.body.loginpassword){
      let sqlResult;
      try{
        sqlResult = await dbScripts.getUserBy('name',req.body.loginusername);
      }
      catch(err){
        if (err instanceof Status){
          err.rethrow(`at server.js, validateCredentials(), line ${177/*LL*/}`);
          reject(err);
          return;
        }
        reject(new Status({status:'error', file:'server.js', function:'validateCredentials()', line:181/*LL*/, msg:'see error message', error:err}));
        return;
      }
      if (sqlResult.data.length == 1 && sqlResult.data[0]['UserName'] == req.body.loginusername){
        bcrypt.compare(req.body.loginpassword, sqlResult.data[0]['UserPassword'], (err,result)=>{
          if (err){
            reject(new Status({status:'denied', file:'server.js', function:'validateCredentials()', line:187/*LL*/, msg:'loginusername or password wrong', usermsg:'The given username and password dont match.bycrypt'}));
            return;
          }
          if (result){
            resolve(true);
            return;
          }
          else{
            reject(new Status({status:'denied', file:'server.js', function:'validateCredentials()', line:195/*LL*/, msg:'loginusername or password wrong', usermsg:'The given username and password dont match.bycrypt', result: result}));
            return;
          }
          
        });        
      }
      else{
        reject(new Status({status:'denied', file:'server.js', function:'validateCredentials()', line:201/*LL*/, msg:'loginusername or password wrong', usermsg:'The given username and password dont match.'}));
        return;
      }      
    }
    else{
      reject(new Status({status:'denied', file:'server.js', function:'validateCredentials()', line:205/*LL*/, msg:'loginusername or password missing', usermsg:'Something went wrong. Make sure you entered a username and a password.'}));
      return;
    }
    });
}






server.listen(PORT || 8322, () => {
  console.log(`https listening on port ${PORT}`);
 });









const socketio = require('socket.io');
const io = socketio.listen(server);


io.use((socket, next) => {
  console.log('io.use :>> ');
  socket.handshake.query.token = socket.handshake.query.token==='undefined'?undefined:socket.handshake.query.token;
  if (socket.handshake.query.token){
    console.log('211 socket.handshake.query.token :>> ', socket.handshake.query.token);
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