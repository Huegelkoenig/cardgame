//const dotenv = require('dotenv');
//dotenv.config();
const jwt = require('jsonwebtoken');
const myJWTsecret = process.env.JWTSECRET;
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

//const Status = require('../status/class_status.js');

let pool;

const TABLE = 'Users'; //TODO: hardcode these values into the script (?)
const USERNAME ='UserName';
const PASSWORD = 'UserPassword';
const EMAIL = 'UserEmail';
const SESSIONID = 'SessionID';
const RECOVERYTOKEN = 'RecoveryToken';
const RECTOKENEXP = 'RecTokenExp';

const MAILPROVIDER = process.env.MAILPROVIDER;
const MAILSENDERADRESS = process.env.MAILSENDERADRESS;
const MAILSENDERPASSWORD = process.env.MAILSENDERPASSWORD;

const DOMAIN = 'https://localhost:8322';

const MIN_NAME_LENGTH = 1;
const MAX_NAME_LENGTH = 30;
const MIN_PASS_LENGTH = 3;
const MAX_PASS_LENGTH = 50;
const MAX_EMAIL_LENGTH = 65;
const ALLOWED_USER_CHARS = /[0-9a-z_.-]*/ig; //TODO: get rid of this, allow all user chars
const HEX_CHARS = /[0-9a-f]*/g;



/*
function validateString(string, minLength, maxLength, $_regex)
description:
  determains if the given string is valid
arguments:
  string... the string to check
  minLength.. the minimum length of the string
  maxLength... the maximum length of the string
  $_regex... (optional) a regular expression for allowed characters to check against, $_regex MUST have a global flag /.../g
return:
  true, if the string is valid, else false
*/
function validateString(string, minLength, maxLength, $_regex = undefined){
  if (string && typeof string === 'string' && string.length>=minLength && string.length<=maxLength){
    if (!$_regex){
      return true;
    }
    let stringMatch = string.match($_regex);
    if (stringMatch!==null && stringMatch[0]===string){
      return true;
    }
  }
  return false;
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
function validateEmail(email){ //TODO: internationalized and other "strange" emailadresses are rejected... get rid of this and send confirmation emails
  if (email && typeof email==='string' && email.length<=MAX_EMAIL_LENGTH ){
    let emailmatch = email.match(/^[0-9a-z]+[0-9a-z._%+]*@[0-9a-z.-]+\.[a-z]{2,}/i);
    if (emailmatch!==null && emailmatch[0]===email && email.match(/[.]{2,}/) === null){
      return true;
    }
  }
  return false;
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
  if (!validateString(req.body.loginusername,MIN_NAME_LENGTH,MAX_NAME_LENGTH, ALLOWED_USER_CHARS) || !validateString(req.body.loginpassword,MIN_PASS_LENGTH,MAX_PASS_LENGTH)){
    res.cookie('cardgameLoginMessage', `The submitted data is invalid. Please enter your username and password again! Error Code "DB-U:${132/*LL*/}"`, {maxAge:5000, sameSite:'Strict', secure:true});
    res.status(401).sendFile('/public/login.html', {root:__dirname+'/../..'});
    return;
  }
  //get hashed password from database
  pool.query(`SELECT ${PASSWORD} FROM ${TABLE} WHERE ${USERNAME} = ?;`, req.body.loginusername, (err, sqlResult)=>{
    if (err){
      new Status({status:'error', file:'db-users.js', func: 'validateCredentials()', line: 139/*LL*/, date:misc.DateToString(new Date()), msg: `pool.query() threw an error`, error: err})
                .log(`logging at db-users.js, function validateCredentials(), line ${140/*LL*/}`);
      res.cookie('cardgameLoginMessage', `Oups, something went wrong. Maybe the server is down. Error-Code "DB-U:${141/*LL*/}"`, {maxAge:5000, sameSite:'Strict', secure:true});
      res.status(500).sendFile('/public/login.html', {root:__dirname+'/../..'});
      return;
    }
    //if sqlResult.length === 0, no user with given username was found.
    if (sqlResult.length === 0){
      bcrypt.compare('dummy','$2b$10$aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',(err,match)=>{}); //this prevents attackers to get valid usernames from response time
      res.cookie('cardgameLoginMessage', `The given username and/or password is invalid. Please try again`, {maxAge:5000, sameSite:'Strict', secure:true});
      res.status(401).sendFile('/public/login.html', {root:__dirname+'/../..'});
      return;
    }
    //compare given password with stored hashpassword
    bcrypt.compare(req.body.loginpassword, sqlResult[0][PASSWORD], (err,match)=>{
      if (err){
        new Status({status:'error', file:'db-users.js', func: 'validateCredentials()', line: 155/*LL*/, date:misc.DateToString(new Date()), msg: `pool.query() threw an error`, error: err})
                .log(`logging at db-users.js, function validateCredentials(), line ${156/*LL*/}`);
        res.cookie('cardgameLoginMessage', `Oups, something went wrong. Error-Code: "DB-U:${157/*LL*/}"`, {maxAge:5000, sameSite:'Strict', secure:true});
        res.status(401).sendFile('/public/login.html', {root:__dirname+'/../..'});
        return;
      }
      //no error, but given and stored passwords aren't identical
      if (!match){
        res.cookie('cardgameLoginMessage', `The given username and/or password is invalid. Please try again`, {maxAge:5000, sameSite:'Strict', secure:true});
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
  creates a sessionID, stores it in DB and sends it as cookie to the user. Also create an authToken (if already exists, resend the old) for a user that has already logged in with a valid authToken or by submitting valid credentials
arguments:
  req... the request object from a app.post('/login',(req,res)=>{}), submitted when a user tries to log in
  req... the response object from a app.post('/login',(req,res)=>{}), submitted when a user tries to log in
  $_oldToken... (optional) the valid authToken of the user (if exists). It will be refreshed with a new token, expiring later
return:
  responds by sending the game.html along with a sessionID and a new authToken (both as seperate cookies). If something went wrong, the login.html will be sent again
*/
function loginResponse(req, res, $_oldToken=undefined){
  //retrieve username from token or from submitted login form
  let username = $_oldToken?$_oldToken.username:req.body.loginusername;
  //create sessionID (128bit) and store it into DB
  let sessionID = crypto.randomBytes(16).toString('hex');
  pool.query(`UPDATE ${TABLE} SET ${SESSIONID} = ? WHERE ${USERNAME} = ?;`, [sessionID, username], (err,sqlResult)=>{
    if (err){
      new Status({status:'error', file:'db-users.js', func: 'loginResponse()', line: 193/*LL*/, date:misc.DateToString(new Date()), msg: `pool.query() threw an error`, error: err})
                .log(`logging at db-users.js, function loginResponse(), line ${194/*LL*/}`);
      res.cookie('cardgameLoginMessage', `Oups, something went wrong. Maybe the server is down. Error-Code "DB-U:${195/*LL*/}"`, {maxAge:5000, sameSite:'Strict', secure:true});
      res.status(500).sendFile('/public/login.html', {root:__dirname+'/../..'});
      return;
    }
    //set a new httpOnly cookie with the cardgameAuthToken
    //TODO: if (!&_oldToken){ let authToken... res.cookie('cardgameAuthToken'...)}   //else: the token is already set, if cookie and authToken have same maxAge/expiresIn
    let authToken = $_oldToken?jwt.sign($_oldToken, myJWTsecret):jwt.sign({username: username}, myJWTsecret, {expiresIn: '10s'}); //TODO: adjust expiresIn to e.g.'24h'
    res.cookie('cardgameAuthToken', authToken, {
      maxAge: 10 * 1000,   // expires after x seconds  (x * 1000) TODO: adjust maxAge to e.g 24*60*60 * 1000 for 24h
      httpOnly: true,       // the cookie is only accessible by the web server
      sameSite:'Strict',
      secure: true          // send only via https
      //domain: DOMAIN,     //DEBUG: if domain or path are set, cookies won't work !?!?!?! due to localhost???
                            // see: https://stackoverflow.com/questions/55847914/how-to-set-cookie-on-localhost-from-express-node-application-so-that-it-can-b
      //path: '/'           // '/' is default, no need to define it here
    });
    //everything seems ok, therefore set cookie with username and sessionID and send the game.html
    res.cookie('cardgameSession', JSON.stringify({username: username, sessionID: sessionID}), {maxAge:5000, sameSite:'Strict', secure:true});
    //TODO: set cardgameSession-cookie also as a JWT-Token containing username and sessionID???
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
    if (!validateString(socket.handshake.query.username,MIN_NAME_LENGTH,MAX_NAME_LENGTH,ALLOWED_USER_CHARS) || !validateString(socket.handshake.query.sessionID,32,32,HEX_CHARS)){
      reject(new Status({status:'rejected', warning:'possible attack on DB', file:'db-users.js', func: 'validateSessionID()', line: 232/*LL*/, date:misc.DateToString(new Date()), msg: `username or sessionID not provided`, username: socket.handshake.query.username, sessionID: socket.handshake.query.sessionID, usermsg: `The given username and/or password is invalid. Please try again!`}));//don't change the usermsg, or an attacker could retrieve usernames
      return;
    }
    pool.query(`SELECT ${SESSIONID} FROM ${TABLE} WHERE ${USERNAME} = ?;`, socket.handshake.query.username, (err, sqlResult)=>{
      if (err){
        reject(new Status({status:'error', file:'db-users.js', func: 'validateSessionID()', line: 237/*LL*/, date:misc.DateToString(new Date()), msg: `pool.query() threw an error`, usermsg: `Oups, something went wrong. Maybe the server is down. Error-Code "DB-U:${237/*LL*/}"`, error: err}));
        return;
      }
      //if sqlResult.length === 0, no user with given username was found  (this may happens, if a user still has a valid authtoken, but is deleted from the DB - or if someone tries to attack the DB)
      if (sqlResult.length === 0){
        reject(new Status({status:'rejected', warning:'possible attack on DB', file:'db-users.js', func: 'validateSessionID()', line: 242/*LL*/, date:misc.DateToString(new Date()), msg: `username doesn't exist in DB`, username: socket.handshake.query.username, sessionID: socket.handshake.query.sessionID, usermsg: `The given username and/or password is invalid. Please try again!`, error: err}));//don't change the usermsg, or an attacker could retrieve usernames
        return;
      }
      //given sessionID doesn't match stored sessionID or has an invalid format  (this should only happen, if someone tries to attack the DB)
      if (socket.handshake.query.sessionID.length!==32 || socket.handshake.query.sessionID !== sqlResult[0][SESSIONID]){
        reject(new Status({status:'rejected', warning:'possible attack on DB', file:'db-users.js', func: 'validateSessionID()', line: 247/*LL*/, date:misc.DateToString(new Date()), msg: `provided sessionID doesn't match stored sessionID "${sqlResult[0][SESSIONID]}"`, username: socket.handshake.query.username, sessionID: socket.handshake.query.sessionID, usermsg: `The given username and/or password is invalid. Please try again!`}));//don't change the usermsg, or an attacker could retrieve usernames
        return;
      }
      //sessionID is ok, delete sessionID from DB, to prevent capturing, reuse, etc....  //resolve true
      pool.query(`UPDATE ${TABLE} SET ${SESSIONID} = ? WHERE ${USERNAME} = ?;`, ['', socket.handshake.query.username], (err,sqlResult)=>{
        if (err){
          reject(new Status({status:'error', file:'db-users.js', func: 'validateSessionID()', line: 253/*LL*/, date:misc.DateToString(new Date()), msg: `pool.query() threw an error`, usermsg: `Oups, something went wrong. Maybe the server is down. Error-Code "DB-U:${253/*LL*/}"`, error: err}));
          return;
        }
        resolve(true);
      });
    });
  });
}



/*
function recoverCredentials(req,res)
description:
  sends an email with a recoverylink to the given emailadress, in case user forgot username or password
arguments:
  req... the request object from a app.post('/recover',(req,res)=>{})
  req... the response object from a app.post('/recover',(req,res)=>{})
return:
  nothing, but the login.html with a cookie stating 'recovery succesfull' (or recover.html with some error message) will be sent to the user
*/
function recoverCredentials(req,res){
  if (!validateEmail(req.body.recoveryMail,1,65)){
    res.cookie('cardgameRecoverMessage', `The submitted email is invalid. Please enter your email adress! Error Code "DB-U:${276/*LL*/}"`, {maxAge:5000, sameSite:'Strict', secure:true});
    res.status(401).sendFile('/public/recover.html', {root:__dirname+'/../..'});
    return;
  }  
  //create a transporter (email provider)
  let transporter = nodemailer.createTransport({
    host: MAILPROVIDER,
    port: 587,
    tls:{
      ciphers: 'SSLv3',
      rejectUnauthorized: false
    },
    auth: {
      user: MAILSENDERADRESS,
      pass: MAILSENDERPASSWORD
    }
  });
  let promises = [];
  //select all users with the given email
  pool.query(`SELECT ${USERNAME} FROM ${TABLE} WHERE ${EMAIL} = ?;`, req.body.recoveryMail, (err, sqlResult)=>{
    if (err){
      new Status({status:'error', file:'db-users.js', func: 'recoverCredentials()', line: 297/*LL*/, date:misc.DateToString(new Date()), msg: `pool.query() threw an error`, error: err})
                .log(`logging at db-users.js, function recoverCredentials(), line ${298/*LL*/}`);
      res.cookie('cardgameRecoverMessage', `Oups, something went wrong. Maybe the server is down. Error-Code "DB-U:${299/*LL*/}"`, {maxAge:5000, sameSite:'Strict', secure:true});
      res.status(500).sendFile('/public/recover.html', {root:__dirname+'/../..'});
      return;
    }    
    //for every username with given email adress...
    sqlResult.forEach((result)=>{
      //...create recoverytoken...
      let recoverUsername = result[USERNAME];
      let recoverID = crypto.randomBytes(16).toString('hex');    
      //... and push a promise which resolves after the recoverytoken has been stored to the database and email has been sent  
      promises.push(new Promise((resolve,reject)=>{
        //store recoverytoken in database
        pool.query(`UPDATE ${TABLE} SET ${RECOVERYTOKEN} = ?, ${RECTOKENEXP} = ? WHERE ${USERNAME} = ?;`, [recoverID, Date.now()+60*60*1000, recoverUsername], (err,sqlResult)=>{
          if (err){
            reject(new Status({status:'error', file:'db-users.js', func: 'recoverCredentials()', line: 313/*LL*/, date:misc.DateToString(new Date()), msg: `pool.query() threw an error`, usermsg: `Oups, something went wrong. Maybe the server is down. Error-Code "DB-U:${313/*LL*/}"`, error: err}));
            return;
          }
          //create email
          let mailOptions = {
            from: MAILSENDERADRESS,
            to: req.body.recoveryMail,
            subject: 'Cardgame Password Reset',
            html: `Hello <b>${recoverUsername}</b>,<br>
            You're receiving this  mail because someone (hopefully it was you) has requested to reset the password for your account.<br>
            If you want to reset your password, just click on the following link within 1 hour to complete the process:<br><br>
            <a href="https://${req.headers.host}/reset/${recoverID}">https://${req.headers.host}/reset/${recoverID}</a> <br><br>
            If you did not request this, or remembered your password again and don't want to change it, please ignore this email.<br>
            If you don't click the link, your password will remain unchanged.`
          };
          //send email
          transporter.sendMail(mailOptions, (err,info)=>{
            if (err){
              reject(new Status({status:'error', file:'db-users.js', func: 'recoverCredentials()', line: 331/*LL*/, date:misc.DateToString(new Date()), msg: `transporter.sendMail threw an error`, usermsg: `Oups, something went wrong. Couldn't sent emails. Error-Code "DB-U:${331/*LL*/}"`, error: err}));
              return;
            }
            resolve(true);
          });
        });
      }));
    });
    //if all recovery tokens are stored to database and all emails have been sent
    Promise.all(promises)
      .then(()=>{
          res.cookie('cardgameLoginMessage', `An email has been sent to the given email adress.<br>Please check your mailbox and follow the instructions there`, {maxAge:5000, sameSite:'Strict', secure:true});
          res.status(200).redirect('/');
          return;
      })
      .catch((err)=>{
        err.log(`logging at db-users.js at recoverCredentials(), line ${347/*LL*/}`);
        res.cookie('cardgameRecoverMessage', err.usermsg, {maxAge:5000, sameSite:'Strict', secure:true});
        res.status(500).sendFile('/public/recover.html', {root:__dirname+'/../..'});
        return;
      });  
  });
}


/*
function resetPassword(req,res)
description:
  lets the user reset his password, after he got the reset-link via recoverCredentials()
arguments:
  req... the request object from a app.post('/reset',(req,res)=>{})
  req... the response object from a app.post('/reset',(req,res)=>{})
return:
  nothing, but the login.html with a cookie stating 'reset succesfull' (or some error message) will be sent to the user
*/
function resetPassword(req,res){
  //1) check if username, password, passwordconfirmation and resetID are valid strings
  let name = req.body.resetusername;
  let password = req.body.resetpassword;
  let passwordconfirmation = req.body.resetpasswordconfirmation;
  let resetID = req.cookies['cardgameResetPassword'];
  if (!name || !password || !passwordconfirmation || !resetID){ //insufficient credentials (must be wrong usage of POSTMAN ;-D), sending reset.html again
    res.cookie('cardgameResetMessage', 'Please enter username and password and also confirm the password.', {maxAge:5000, sameSite:'Strict', secure:true});
    res.status(401).sendFile('/public/reset.html',{root:__dirname+'/../..'});
    return;
  }
  else if (!validateString(name, MIN_NAME_LENGTH, MAX_NAME_LENGTH, ALLOWED_USER_CHARS)){
    res.cookie('cardgameResetMessage', `Reset aborted! The username ${name} is invalid.<br>The username must have between ${MIN_NAME_LENGTH} and ${MAX_NAME_LENGTH} characters.<br>Allowed characters are a-z, A-Z, 0-9, as well as . (DOT), - (MINUS) and _ (UNDERSCORE)`, {maxAge:5000, sameSite:'Strict', secure:true});
    res.status(401).sendFile('/public/reset.html',{root:__dirname+'/../..'});
    return;
  }
  else if (!validateString(password, MIN_PASS_LENGTH, MAX_PASS_LENGTH)){
    res.cookie('cardgameResetMessage', `Reset aborted! The password is invalid.<br>The password must have between ${MIN_PASS_LENGTH} and ${MAX_PASS_LENGTH} characters.`, {maxAge:5000, sameSite:'Strict', secure:true});
    res.status(401).sendFile('/public/reset.html',{root:__dirname+'/../..'});
    return;
  }
  else if (password !== passwordconfirmation){
    res.cookie('cardgameResetMessage', `Reset aborted! The confirmation doesn't match the password. Please re-enter your password and confirm it.`, {maxAge:5000, sameSite:'Strict', secure:true});
    res.status(401).sendFile('/public/reset.html',{root:__dirname+'/../..'});
    return;
  }
  else if (!validateString(resetID,32,32,HEX_CHARS)){
    res.cookie('cardgameResetMessage', `Reset denied! Please click the link in your email again.`, {maxAge:5000, sameSite:'Strict', secure:true});
    res.status(401).sendFile('/public/reset.html',{root:__dirname+'/../..'});
    return;
  }
  else{
    //credentials seem to be valid strings
    //select all rows, where username matches resetID
    pool.query(`SELECT ${RECTOKENEXP} FROM ${TABLE} WHERE ${USERNAME} = ? AND ${RECOVERYTOKEN} = ?;`, [name, resetID], (err, sqlResult)=>{
      if (err){
        new Status({status:'error', file:'db-users.js', func: 'resetPassword()', line: 403/*LL*/, date:misc.DateToString(new Date()), msg: `pool.query() threw an error`, error: err})
                  .log(`logging at db-users.js, function resetPassword(), line ${404/*LL*/}`);
        res.cookie('cardgameResetMessage', `Oups, something went wrong. Maybe the server is down. Error-Code "DB-U:${405/*LL*/}"`, {maxAge:5000, sameSite:'Strict', secure:true});
        res.status(500).sendFile('/public/reset.html', {root:__dirname+'/../..'});
        return;
      }
      //if no match or time expired
      if (sqlResult.length!==1 || sqlResult[0][RECTOKENEXP]<Date.now()){
        res.cookie('cardgameResetMessage', `Reset aborted. You entered the wrong username or the reset-link is expired. You may <a href="/recover">request another reset link</a>. Error-Code "DB-U:${411/*LL*/}"`, {maxAge:5000, sameSite:'Strict', secure:true});
        res.status(500).sendFile('/public/reset.html', {root:__dirname+'/../..'});
        return;
      }
      //resetID is still valid and matches username
      //generate a salt, afterwards hash the password with 10 rounds
      bcrypt.hash(password, 10, (err,hash)=>{
        if (err){
          new Status({status:'error', file:'db-users.js', func: 'resetPassword()', line: 419/*LL*/, date:misc.DateToString(new Date()), msg: `bcrypt.hash() threw an error`, error: err})
                    .log(`logging at db-users.js, function resetPassword(), line ${420/*LL*/}`);
          res.cookie('cardgameResetMessage', `Oups, seems like you found a bug! ErrorCode ${421/*LL*/}`, {maxAge:5000, sameSite:'Strict', secure:true});
          res.status(500).sendFile('/public/reset.html',{root:__dirname+'/../..'});
          return;
        }
        //update password in database, delete recoveryID and link expiration
        pool.query(`UPDATE ${TABLE} SET ${PASSWORD} = ?, ${RECOVERYTOKEN} = ?, ${RECTOKENEXP} = ? WHERE ${USERNAME} = ?;`, [hash, null, null, name], (err,sqlResult)=>{
          if (err){
            new Status({status:'error', file:'db-users.js', func: 'resetPassword()', line: 428/*LL*/, date:misc.DateToString(new Date()), msg: `pool.query() threw an error`, error: err})
                  .log(`logging at db-users.js, function resetPassword(), line ${429/*LL*/}`);
            res.cookie('cardgameResetMessage', `Oups, something went wrong. Maybe the server is down. Error-Code "DB-U:${430/*LL*/}"`, {maxAge:5000, sameSite:'Strict', secure:true});
            res.status(500).sendFile('/public/reset.html', {root:__dirname+'/../..'});
            return;
          }
          //password updated, user must login again, reset AuthToken
          res.cookie('cardgameAuthToken', '', {
            maxAge: 50 * 1000,     // would expire after x seconds  (x * 1000) TODO: adjust maxAge to e.g 24*60*60 * 1000 for 24h
            httpOnly: true,       // the cookie is only accessible by the web server
            sameSite:'Strict',
            secure: true         // send only via https
            //domain: DOMAIN,    //DEBUG: if domain or path are set, cookies won't work !?!?!?! due to localhost???
            //path: '/'
          });
          res.cookie('cardgameLoginMessage', `You changed your password succesfully. Please log in again!`, {maxAge:5000, sameSite:'Strict', secure:true});
          res.status(200).redirect('/');
        });
      });
    });
  }
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
    res.cookie('cardgameRegisterMessage', 'Please enter username and password and also confirm the password. Email is optional.', {maxAge:5000, sameSite:'Strict', secure:true});
    res.status(401).sendFile('/public/register.html',{root:__dirname+'/../..'});
    return;
  }
  else if (!validateString(name, MIN_NAME_LENGTH, MAX_NAME_LENGTH, ALLOWED_USER_CHARS)){
    res.cookie('cardgameRegisterMessage', `Registration aborted! The username ${name} is invalid.<br>The username must have between ${MIN_NAME_LENGTH} and ${MAX_NAME_LENGTH} characters.<br>Allowed characters are a-z, A-Z, 0-9, as well as . (DOT), - (MINUS) and _ (UNDERSCORE)`, {maxAge:5000, sameSite:'Strict', secure:true});
    res.status(401).sendFile('/public/register.html',{root:__dirname+'/../..'});
    return;
  }
  else if (!validateString(password, MIN_PASS_LENGTH, MAX_PASS_LENGTH)){
    res.cookie('cardgameRegisterMessage', `Registration aborted! The password is invalid.<br>The password must have between ${MIN_PASS_LENGTH} and ${MAX_PASS_LENGTH} characters.`, {maxAge:5000, sameSite:'Strict', secure:true});
    res.status(401).sendFile('/public/register.html',{root:__dirname+'/../..'});
    return;
  }
  else if (password !== passwordconfirmation){
    res.cookie('cardgameRegisterMessage', `Registration aborted! The confirmation doesn't match the password. Please re-enter your password and confirm it.`, {maxAge:5000, sameSite:'Strict', secure:true});
    res.status(401).sendFile('/public/register.html',{root:__dirname+'/../..'});
    return;
  }
  else if (email && !validateEmail(email)){
    res.cookie('cardgameRegisterMessage', 'Registration aborted! The provided emailadress seems to be invalid', {maxAge:5000, sameSite:'Strict', secure:true});
    res.status(401).sendFile('/public/register.html',{root:__dirname+'/../..'});
    return;
  }
  else{
  //credentials seem to be ok
  // 2) try to register the user
    bcrypt.hash(password, 10, (err,hash)=>{//generate a salt, afterwards hash the password with 10 rounds
      if (err){
        new Status({status:'error', file:'db-users.js', func: 'registerUser()', line: 520/*LL*/, date:misc.DateToString(new Date()), msg: `bcrypt.hash() threw an error`, error: err})
                  .log(`logging at db-users.js, function registerUser(), line ${521/*LL*/}`);
        res.cookie('cardgameRegisterMessage', `Oups, seems like you found a bug! ErrorCode ${522/*LL*/}`, {maxAge:5000, sameSite:'Strict', secure:true});
        res.status(500).sendFile('/public/register.html',{root:__dirname+'/../..'});
        return;
      }
      //successfully hashed, now insert into DB
      pool.query(`INSERT INTO ${TABLE} (${USERNAME}, ${PASSWORD}, ${EMAIL}) VALUES (?, ?, ?);`, [name, hash, email], (err,sqlResult)=>{
        if (err){
          if (err.errno == 1062){ //Tried to insert a duplicate entry bc username is already taken
            res.cookie('cardgameRegisterMessage', `Registration aborted. User '${name}' already exists. Please try another username.`, {maxAge:5000, sameSite:'Strict', secure:true});
            res.status(401).sendFile('/public/register.html',{root:__dirname+'/../..'});
            return;
          }
          new Status({status:'error', file:'db-users.js', func: 'registerUser()', part: '2) try to register the user', line: 534/*LL*/, date:misc.DateToString(new Date()), msg: `pool.query threw an error, see .error for details`, error: err})
                    .log(`logging at db-users.js, function registerUser(), line ${535/*LL*/}`);
          res.cookie('cardgameRegisterMessage', `Oups, something went wrong! Maybe the database server is down!? ErrorCode ${536/*LL*/}`, {maxAge:5000, sameSite:'Strict', secure:true});
          res.status(500).sendFile('/public/register.html',{root:__dirname+'/../..'});
          return;
        }
        res.cookie('cardgameRegisterMessage', 'You registered succesfully. You will be redirected to the login page shortly.', {maxAge:5000, sameSite:'Strict', secure:true});
        res.cookie('cardgameLoginSuccess', true, {maxAge:5000, sameSite:'Strict', secure:true});
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
  recoverCredentials,
  resetPassword,
  registerUser
  }
}