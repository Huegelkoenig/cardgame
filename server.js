const dotenv = require('dotenv');
dotenv.config();
console.log('\x1b[32m%s\x1b[0m','----------- starting new node.js session ------------------------');
const express = require('express');
const http = require('http');
const https = require('https');

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
  console.log('received GET / request');
  if (validateCookieToken(req)){
    console.log('GET with valid cookie');
    //set cookie again to extend expiration date
    res.cookie('myAuthToken', req.cookies.myAuthToken, {
      maxAge: 3 * 1000, // would expire after x seconds  (x * 1000)
      httpOnly: true, // The cookie is only accessible by the web server
      secure: true, // send only via https
      domain: DOMAIN,  //TODO
      path: '/'
    });
    res.status(200).sendFile(__dirname + '/private/game.html'); //TODO:
  }  
  else{
  // no cookie => no authorization => need to login on index.html
    console.log('GET without valid cookie');
    res.status(200).sendFile(__dirname+'/public/login.html');  //sends loginFile
  }
});


app.get('/register',(req,res)=>{
  res.status(200).sendFile(__dirname+'/public/register.html');
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
    try{
      if (await validateCredentials(req)){
        console.log('succesful');
        //login succesfull
        let token;
        token = jwt.sign({username: req.body.loginusername}, myJWTsecret);
        res.cookie('myAuthToken', token, {
          maxAge: 3 * 1000, // would expire after x seconds  (x*1000)
          httpOnly: true, // The cookie only accessible by the web server
          secure: true, // send only via https
          domain: DOMAIN,
          path: '/'
        });
        console.log('token :>> ', token);
        res.status(200).sendFile(__dirname + '/private/game.html');
      }
      else{
        console.log({error: 'not succesful. Wrong username or password'});
        res.status(401).send('login credentials not correct');
        //res.status(401).sendFile(__dirname + '/public/index.html', {headers: {'x-sent': true}});  //sends loginFile again
      }
    }
    catch (error){
        console.log(`error Zeile ${117/*LL*/}:`, error);
        res.status(401).send('internal error');
    }
     
    }
    
  }
);

app.post('/register', async (req,res)=>{
    if (req.body.registerpassword===req.body.registerpasswordconfirmation){
      let registerResult;
      try{
        registerResult = await dbScripts.registerUser(req.body.registerusername, req.body.registerpassword, req.body.registeremail, req.body.registerpasswordconfirmation);
        console.log('registerResult in app.post(/register) :>> ', registerResult);
      }
      catch(err){
        if (err instanceof Status){
          err.log();
          res.cookie('registerwarning', err.message||err.msg + '', {maxAge:1000});
          res.status(401).sendFile(__dirname+'/public/register.html');
        }
        
      }
      
     
      if (registerResult && registerResult.state){
        res.cookie('registerwarning', 'You registered succesfully. You will be redirected to the login page shortly.', {maxAge:1000});
        res.cookie('success', true, {maxAge:1000});
        res.status(200).sendFile(__dirname + '/public/register.html');
      }
    else{
      res.cookie('registerwarning', 'passwords dont match', {maxAge:1000});
      res.status(401).sendFile(__dirname+'/public/register.html');    
    }
  }
  else{
    //first load of the register page
    res.status(200).sendFile(__dirname+'/public/register.html');
  }
});


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
  console.log('(cookieToken nicht vorhanden, daher)');
  return false;
}

async function validateCredentials(req){
  //validate username and password
  console.log('validating credentials:');
  if (req.body.loginusername && req.body.loginpassword){
    console.log('username: ', req.body.loginusername);
    console.log('password: ', req.body.loginpassword);
    let userData;
    try{
      userData = await dbScripts.getUserBy('name',req.body.loginusername)
    }
    catch(error){
      if (error.myerror == 'poolquery'){
        console.log('\nERROR in function validateCredentials: \n' + error.myerror + '\n' + error.error);
        return false;
      }
      else{
        console.log('\nunhandled error\nthrowing it back:>>\n ', error);
        throw error;
      }  
    }

    if (userData.length == 1 && userData[0]['UserName'] == req.body.loginusername && userData[0]['UserPassword'] == req.body.loginpassword){
      return true;
    }
  }
  return false;
}






server.listen(PORT || 8322, () => {
  console.log(`https listening on port ${PORT}`);
  console.trace('hi');
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