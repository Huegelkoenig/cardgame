const dotenv = require('dotenv');
dotenv.config();
const jwt = require('jsonwebtoken');
const myJWTsecret = process.env.JWTSECRET;
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const Status = require('../status/class_status.js');

let pool;

const TABLE = 'Users'; //TODO: hardcode these values into the script (?)
const USERNAME ='UserName';
const PASSWORD = 'UserPassword';
const EMAIL = 'UserEmail';
const SESSIONID = 'SessionID';
const SOCKETID = 'SocketID';


const DOMAIN = 'https://localhost:8322';
const MIN_NAME_LENGTH = 1;
const MAX_NAME_LENGTH = 30;
const MIN_PASS_LENGTH = 3;
const MAX_PASS_LENGTH = 50;
const MAX_EMAIL_LENGTH = 65;
const ALLOWED_USER_CHARS = /[0-9a-z_.-]/ig;


/* //TODO: move to own module
function DateToString(date)
description:
  returns a string of the given date in the format 'YYYY/MM/DD HH:MM:SS:MMM'
arguments:
  date... a Date() object
return:
  returns a string of the given date in the format 'YYYY/MM/DD HH:MM:SS:MMM'
*/
function DateToString(date){
  let time = '';
  let dummy;
  time += date.getFullYear();
  time +='/';
  dummy = date.getMonth();
  time += dummy>9?dummy:('0'+dummy);
  time +='/';
  dummy = date.getDay();
  time += dummy>9?dummy:('0'+dummy);
  time +=' ';
  dummy = date.getHours();
  time += dummy>9?dummy:('0'+dummy);
  time +=':';
  dummy = date.getMinutes();
  time += dummy>9?dummy:('0'+dummy);
  time +=':';
  dummy = date.getSeconds();
  time += dummy>9?dummy:('0'+dummy);
  time +=':';
  dummy = date.getMilliseconds();
  time += dummy>99?dummy:(dummy>9?('0'+dummy):('00'+dummy));
  return time;
}



/*
function validateCredentials(req, res)
description:
  checks, if given username and password are valid, so user can be logged in
arguments:
  req... the request object from a app.post('/login',(req,res)=>{}), submitted when a user tries to log in
  req... the response object from a app.post('/login',(req,res)=>{}), submitted when a user tries to log in
return:
  returns a string of the given date in the format 'YYYY/MM/DD HH:MM:SS:MMM'
*/
function validateCredentials(req, res){
  //check if username and password are existing and string
  if (!req.body.loginusername || !req.body.loginpassword || !(typeof req.body.loginusername === "string") || !(typeof req.body.loginpassword === "string")){
    res.cookie('loginMessage', `The submitted data is corrupted. Please enter your username and password again! Error Code "DB-U:${78/*LL*/}"`, {maxAge:5000, sameSite:'Strict', secure:true});
    res.status(401).sendFile('/public/login.html', {root:__dirname+'/../..'});
    return;
  }
  //get hashed password from database
  pool.query(`SELECT ${PASSWORD} FROM ${TABLE} WHERE ${USERNAME} = ?;`, req.body.loginusername, (err, sqlResult)=>{
    if (err){
      new Status({status:'error', file:'db-users.js', func: 'validateCredentials()', line: 85/*LL*/, date:DateToString(new Date()), msg: `pool.query() threw an error`, error: err})
                .log(`logging at db-users.js, function validateCredentials(), line ${86/*LL*/}`);
      res.cookie('loginMessage', `Oups, something went wrong. Maybe the server is down. Error-Code "DB-U:${87/*LL*/}"`, {maxAge:5000, sameSite:'Strict', secure:true});
      res.status(401).sendFile('/public/login.html', {root:__dirname+'/../..'});
      return;
    }
    //if sqlResult.length === 0, no user with given username was found.
    if (sqlResult.length === 0){
      bcrypt.compare('dummy','$2b$10$aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',(err,match)=>{}); //this prevents attackers to get valid usernames from response time
      res.cookie('loginMessage', `The given username and/or password is invalid. Please try again`, {maxAge:5000, sameSite:'Strict', secure:true});
      res.status(401).sendFile('/public/login.html', {root:__dirname+'/../..'});
      return;
    }
    //compare given password with stored hashpassword
    bcrypt.compare(req.body.loginpassword, sqlResult[0][PASSWORD], (err,match)=>{
      if (err){
        new Status({status:'error', file:'db-users.js', func: 'validateCredentials()', line: 101/*LL*/, date:DateToString(new Date()), msg: `pool.query() threw an error`, error: err})
                .log(`logging at db-users.js, function validateCredentials(), line ${102/*LL*/}`);
        res.cookie('loginMessage', `Oups, something went wrong. Error-Code: "DB-U:${103/*LL*/}"`, {maxAge:5000, sameSite:'Strict', secure:true});
        res.status(401).sendFile('/public/login.html', {root:__dirname+'/../..'});
        return;
      }
      //no error, but given and stored passwords aren't identical
      if (!match){
        res.cookie('loginMessage', `The given username and/or password is invalid. Please try again`, {maxAge:5000, sameSite:'Strict', secure:true});
        res.status(401).sendFile('/public/login.html', {root:__dirname+'/../..'});
        return;
      }
      //credentials are ok, send response to user
      loginResponse(req,res);      
    });
  });
}



/*
function loginResponse(req, res, $_oldToken)
description:
  creates a sessionID and a new/refreshed authToken for a user that has already logged in with a valid authToken or by submitting valid credentials
arguments:
  req... the request object from a app.post('/login',(req,res)=>{}), submitted when a user tries to log in
  req... the response object from a app.post('/login',(req,res)=>{}), submitted when a user tries to log in
  $_oldToken... (optional) the valid authToken of the user (if exists). It will be refreshed with a new token, expiring later
return:
  responds by sending the game.html along with a sessionID and a new authToken. If something went wrong, the login.html will be sent again
*/
function loginResponse(req, res, $_oldToken=undefined){
  //retrieve username from token or from submitted login form
  let username = $_oldToken?$_oldToken.username:req.body.loginusername;
  //create sessionID (128bit) and store it into DB
  let sessionID = crypto.randomBytes(16).toString('hex');
  pool.query(`UPDATE ${TABLE} SET ${SESSIONID} = ? WHERE ${USERNAME} = ?;`, [sessionID, username], (err,sqlResult)=>{
    if (err){
      new Status({status:'error', file:'db-users.js', func: 'loginResponse()', line: 139/*LL*/, date:DateToString(new Date()), msg: `pool.query() threw an error`, error: err})
                .log(`logging at db-users.js, function loginResponse(), line ${140/*LL*/}`);
      res.cookie('loginMessage', `Oups, something went wrong. Maybe the server is down. Error-Code "DB-U:${141/*LL*/}"`, {maxAge:5000, sameSite:'Strict', secure:true});
      res.status(401).sendFile('/public/login.html', {root:__dirname+'/../..'});
      return;
    }
    //set a new http-only cookie with the cardgameAuthToken
    let authToken = jwt.sign({username: username}, myJWTsecret, {expiresIn: '24h'});
    res.cookie('cardgameAuthToken', authToken, {
      maxAge: 5 * 1000,     // would expire after x seconds  (x * 1000) TODO: adjust maxAge to e.g 24h
      httpOnly: true,       // the cookie is only accessible by the web server
      sameSite:'Strict',
      secure: true         // send only via https
      //domain: DOMAIN,    //TODO: look at these two. if domain or path are set, cookies won't work !?!?!?!
      //path: '/'
    });
    //set cookie with username and sessionID
    res.cookie('session', JSON.stringify({username: username, sessionID: sessionID}), {maxAge:5000, sameSite:'Strict', secure:true});
    //send file game.html
    res.status(200).sendFile('/private/game.html', {root:__dirname+'/../..'});
  });
}



/*
function validateSessionID(socket)
description:
  checks, if the given sessionID matches the stored sessionID
arguments:
  socket... a socket object created by socket.io
return:
  returns a promise, which resolves a Status object with status: 'ok' if the sessionId matches the stored sessionID, else rejects a Status object with the error corresponding message
*/
function validateSessionID(socket){
  return new Promise((resolve, reject)=>{
    //provided username or sessionID have an invalid format (this should only happen, if someone tries to attack the DB)
    if (!socket.handshake.query.username || typeof socket.handshake.query.username!=='string' || !socket.handshake.query.sessionID || typeof socket.handshake.query.sessionID!=='string'){
      reject(new Status({status:'rejected', warning:'possible attack on DB', file:'db-users.js', func: 'validateSessionID()', line: 177/*LL*/, date:DateToString(new Date()), msg: `username or sessionID not provided`, username: socket.handshake.query.username, sessionID: socket.handshake.query.sessionID, usermsg: `The given username and/or password is invalid. Please try again!`}));//don't change the usermsg, or an attacker could retrieve usernames
      return;
    }
    pool.query(`SELECT ${SESSIONID} FROM ${TABLE} WHERE ${USERNAME} = ?;`, socket.handshake.query.username, (err, sqlResult)=>{
      if (err){
        reject(new Status({status:'error', file:'db-users.js', func: 'validateSessionID()', line: 182/*LL*/, date:DateToString(new Date()), msg: `pool.query() threw an error`, usermsg: `Oups, something went wrong. Maybe the server is down. Error-Code "DB-U:${182/*LL*/}"`, error: err}));
        return;
      }
      //if sqlResult.length === 0, no user with given username was found  (this may happens, if a user still has a valid authtoken, but is deleted from the DB - or if someone tries to attack the DB)
      if (sqlResult.length === 0){
        reject(new Status({status:'rejected', warning:'possible attack on DB', file:'db-users.js', func: 'validateSessionID()', line: 187/*LL*/, date:DateToString(new Date()), msg: `username doesn't exist in DB`, username: socket.handshake.query.username, sessionID: socket.handshake.query.sessionID, usermsg: `The given username and/or password is invalid. Please try again!`, error: err}));//don't change the usermsg, or an attacker could retrieve usernames
        return;
      }
      //given sessionID doesn't match stored sessionID or has an invalid format  (this should only happen, if someone tries to attack the DB)
      if (socket.handshake.query.sessionID.length!==32 || socket.handshake.query.sessionID !== sqlResult[0][SESSIONID]){
        reject(new Status({status:'rejected', warning:'possible attack on DB', file:'db-users.js', func: 'validateSessionID()', line: 192/*LL*/, date:DateToString(new Date()), msg: `provided sessionID doesn't match stored sessionID "${sqlResult[0][SESSIONID]}"`, username: socket.handshake.query.username, sessionID: socket.handshake.query.sessionID, usermsg: `The given username and/or password is invalid. Please try again!`, error: err}));//don't change the usermsg, or an attacker could retrieve usernames
        return;
      }
      //sessionID is ok, delete sessionID from DB, to prevent capturing, resolve true
      pool.query(`UPDATE  ${TABLE} SET ${SESSIONID} = ? WHERE ${USERNAME} = ?;`, ['', socket.handshake.query.username], (err,sqlResult)=>{
        if (err){
          reject(new Status({status:'error', file:'db-users.js', func: 'validateSessionID()', line: 198/*LL*/, date:DateToString(new Date()), msg: `pool.query() threw an error`, usermsg: `Oups, something went wrong. Maybe the server is down. Error-Code "DB-U:${198/*LL*/}"`, error: err}));
          return;
        }
        resolve(true);
      });
    });
  });
}




/*
function validateString(string, minLength, maxLength, $_regex)
description:
  determains if the given string is valid
arguments:
  string... the string to check
  minLength.. the minimum length of the string
  maxLength... the maximum length of the string
  $_regex... (optional) a regular expression for allowed characters to check against, $_regex MUST have a global flag //g
return:
  true, if the string is valid, else false
*/
function validateString(string, minLength, maxLength, $_regex = undefined){
  return (string &&  typeof string === 'string' && string.length>=minLength && string.length<=maxLength && (!$_regex || ($_regex && string.match($_regex).length===string.length)));
}



/*
function validateEmail(email)
description:
  determains if the given email is valid (non standard emails excluded)
arguments:
  email... string
return:
  true, if the email is valid, else false
*/
function validateEmail(email){
  if (email && typeof email==='string' && email.length<=MAX_EMAIL_LENGTH ){
    let emailmatch = email.match(/^[0-9a-z]+[0-9a-z._%+]*@[0-9a-z.-]+\.[a-z]{2,}/i);
    if (emailmatch != null && emailmatch[0]===email && email.match(/[.]{2,}/) === null){
      return true;
    }
  }
  return false;
}



/*
function registerUser(req,res)
description:
  registers a new user if the given credentials are valid und username isn't taken yet
arguments:
  name... a string
  password... a string
  email... a string
  passwordconfirmation... should be the same as email
return:
  nothing, but a file (TODO: single page application?) with a specific message (stating 'registration succesfull' or some error) will be sent to the user
*/
function registerUser(req,res){
  //1) check if username, password, passwordconfirmation (and email if provided) are valid
  let name = req.body.registerusername;
  let password = req.body.registerpassword;
  let email = req.body.registeremail.length>0?req.body.registeremail:null; //if no email is provided, req.body.registeremail == '' , thus will be set to null
  let passwordconfirmation = req.body.registerpasswordconfirmation;
  if (!name || !password || !passwordconfirmation){ //insufficient credentials (must be wrong usage of POSTMAN ;-D), sending register.html again
    res.cookie('registerMessage', 'Please enter username and password and also confirm the password. Email is optional.', {maxAge:5000, sameSite:'Strict', secure:true});
    res.status(200).sendFile('/public/register.html',{root:__dirname+'/../..'});
    return;
  }
  else if (!validateString(name, MIN_NAME_LENGTH, MAX_NAME_LENGTH, ALLOWED_USER_CHARS)){
    res.cookie('registerMessage', `Registration aborted! The username ${name} is invalid.<br>The username must have between ${MIN_NAME_LENGTH} and ${MAX_NAME_LENGTH} characters.<br>Allowed characters are a-z, A-Z, 0-9, as well as . (DOT), - (MINUS) and _ (UNDERSCORE)`, {maxAge:5000, sameSite:'Strict', secure:true});
    res.status(401).sendFile('/public/register.html',{root:__dirname+'/../..'});
    return;
  }
  else if (!validateString(password, MIN_PASS_LENGTH, MAX_PASS_LENGTH)){
    res.cookie('registerMessage', `Registration aborted! The password is invalid.<br>The password must have between ${MIN_PASS_LENGTH} and ${MAX_PASS_LENGTH} characters.`, {maxAge:5000, sameSite:'Strict', secure:true});
    res.status(401).sendFile('/public/register.html',{root:__dirname+'/../..'});
    return;
  }
  else if (password !== passwordconfirmation){
    res.cookie('registerMessage', `Registration aborted! The confirmation doesn't match the password. Please re-enter your password and confirm it.`, {maxAge:5000, sameSite:'Strict', secure:true});
    res.status(401).sendFile('/public/register.html',{root:__dirname+'/../..'});
    return;
  }
  else if (email && !validateEmail(email)){
    res.cookie('registerMessage', 'Registration aborted! The provided emailadress seems to be invalid', {maxAge:5000, sameSite:'Strict', secure:true});
    res.status(401).sendFile('/public/register.html',{root:__dirname+'/../..'});
    return;
  }
  else{
  //credentials seem to be ok
  // 2) try to register the user
    bcrypt.hash(password, 10, (err,hash)=>{//generate a salt, afterwards hash the password with 10 rounds
      if (err){
        new Status({status:'error', file:'db-users.js', func: 'registerUser()', line: 297/*LL*/, date:DateToString(new Date()), msg: `bcrypt.hash() threw an error`, error: err})
                  .log(`logging at db-users.js, function registerUser(), line ${298/*LL*/}`);
        res.cookie('registerMessage', `Oups, seems like you found a bug! ErrorCode ${299/*LL*/}`, {maxAge:5000, sameSite:'Strict', secure:true});
        res.status(401).sendFile('/public/register.html',{root:__dirname+'/../..'});
        return;
      }
      //successfully hashed, now insert into DB
      pool.query(`INSERT INTO ${TABLE} (${USERNAME}, ${PASSWORD}, ${EMAIL}) VALUES (?, ?, ?);`, [name, hash, email], (err,sqlResult)=>{
        if (err){
          if (err.errno == 1062){ //Tried to insert a duplicate entry bc username is already taken
            res.cookie('registerMessage', `Registration aborted. User '${name}' already exists. Please try another username.`, {maxAge:5000, sameSite:'Strict', secure:true});
            res.status(401).sendFile('/public/register.html',{root:__dirname+'/../..'});
            return;
          }
          new Status({status:'error', file:'db-users.js', func: 'registerUser()', part: '2) try to register the user', line: 311/*LL*/, date:DateToString(new Date()), msg: `pool.query threw an error, see .error for details`, error: err})
                    .log(`logging at db-users.js, function registerUser(), line ${312/*LL*/}`);
          res.cookie('registerMessage', `Oups, something went wrong! Maybe the database server is down!? ErrorCode ${313/*LL*/}`, {maxAge:5000, sameSite:'Strict', secure:true});
          res.status(401).sendFile('/public/register.html',{root:__dirname+'/../..'});
          return;
        }
        res.cookie('registerMessage', 'You registered succesfully. You will be redirected to the login page shortly.', {maxAge:5000, sameSite:'Strict', secure:true});
        res.cookie('success', true, {maxAge:5000, sameSite:'Strict', secure:true});
        res.status(200).sendFile('/public/register.html',{root:__dirname+'/../..'});
        return;
      });
    });
  }
}



module.exports = (global_pool) => { 
  pool = global_pool;
  return {
  validateCredentials,
  loginResponse,
  validateSessionID,
  registerUser
  }
}