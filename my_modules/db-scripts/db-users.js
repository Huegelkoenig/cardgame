//const dotenv = require('dotenv');
//dotenv.config();
const jwt = require('jsonwebtoken');
const myJWTsecret = process.env.JWTSECRET;
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const misc = require('../misc/misc.js');
const Status = require('../status/class_status.js');

let pool;
const playerDBscripts = require('./db-players.js')(pool);

const TABLE = 'users'; //TODO: hardcode these values into the script or dotenv(?)
const USERNAME ='Username';
const PASSWORD = 'Password';
const EMAIL = 'Email';
const SESSIONID = 'SessionID';
const RECOVERYTOKEN = 'RecoveryToken';
const RECTOKENEXP = 'RecTokenExp';

const MAILPROVIDER = process.env.MAILPROVIDER;
const MAILSENDERADRESS = process.env.MAILSENDERADRESS;
const MAILSENDERPASSWORD = process.env.MAILSENDERPASSWORD;

//const DOMAIN = 'https://localhost:8322';  //TODO: change

const MIN_NAME_LENGTH = 1;
const MAX_NAME_LENGTH = 30;
const MIN_PASS_LENGTH = 3;
const MAX_PASS_LENGTH = 50;
const MAX_EMAIL_LENGTH = 65;
const ALLOWED_USER_CHARS = /[0-9a-z_.-]*/ig; //TODO: get rid of this, allow all user chars
const HEX_CHARS = /[0-9a-f]*/g;




/*
function validateEmail(email)
description:
  determains if the given email is valid (non standard emails excluded)
arguments:
  email... string
return:
  true, if the email format is valid, else false
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
  calls loginRespsone()if everything is ok, else responses with 'loginView' and an "failed" message if credentials are wrong. If something went wrong, the 'errorView' will be sent
*/
function validateCredentials(req, res){
  //check if username and password are existing and string
  if (!misc.validateString(req.body.loginusername,MIN_NAME_LENGTH,MAX_NAME_LENGTH, ALLOWED_USER_CHARS) || !misc.validateString(req.body.loginpassword,MIN_PASS_LENGTH,MAX_PASS_LENGTH)){
    res.status(401).send(JSON.stringify({view: 'loginView', msg: `The submitted data is invalid. Please enter your username and password again! Error Code "DB-U:${74/*LL*/}"`}));
    return;
  }
  //get hashed password from database
  pool.query(`SELECT ${PASSWORD} FROM ${TABLE} WHERE ${USERNAME} = ?;`, req.body.loginusername, (err, sqlResult)=>{
    if (err){
      new Status({status:'error', file:'db-users.js', func: 'validateCredentials()', line: 80/*LL*/, date:misc.DateToString(new Date()), msg: `pool.query() threw an error`, error: err})
                .log(`logging at db-users.js, function validateCredentials(), line ${81/*LL*/}`);
      res.status(500).send(JSON.stringify({view: 'errorView', msg: `Maybe the server is down. Error-Code "DB-U:${82/*LL*/}"`}));
      return;
    }
    //if sqlResult.length === 0, no user with given username was found.
    if (sqlResult.length === 0){
      bcrypt.compare('dummy','$2b$10$aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',(err,match)=>{}); //this prevents attackers to get valid usernames from response time
      res.status(401).send(JSON.stringify({view: 'loginView', msg: `The given username and/or password is invalid. Please try again! (Dev:1)`})); //DELETE: (Dev:1)
      return;
    }
    //compare given password with stored hashpassword
    bcrypt.compare(req.body.loginpassword, sqlResult[0][PASSWORD], (err,match)=>{
      if (err){
        new Status({status:'error', file:'db-users.js', func: 'validateCredentials()', line: 94/*LL*/, date:misc.DateToString(new Date()), msg: `pool.query() threw an error`, error: err})
                .log(`logging at db-users.js, function validateCredentials(), line ${95/*LL*/}`);
        res.status(500).send(JSON.stringify({view: 'errorView', msg: `There's a bug in my code. Error-Code: "DB-U:${96/*LL*/}"`}));
        return;
      }
      //no error, but given and stored passwords aren't identical
      if (!match){
        res.status(401).send(JSON.stringify({view: 'loginView', msg: `The given username and/or password is invalid. Please try again! (Dev: 2)`})); //DELETE: (Dev:2)
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
  creates a sessionID, stores it in DB and sends it to the user. Also create an authToken (if already exists, resend the old) for a user that has already logged in with a valid authToken or by submitting valid credentials
arguments:
  req... the request object from a app.post('/login',(req,res)=>{}), submitted when a user tries to log in
  res... the response object from a app.post('/login',(req,res)=>{}), submitted when a user tries to log in
  $_oldToken... (optional) the valid authToken of the user (if exists). It will be refreshed with a new token, expiring later
return:
  responds by sending 'canvasView' along with the username and sessionID and a new authToken (as http-only-cookie). If something went wrong, the 'errorView' will be sent
*/
function loginResponse(req, res, $_oldToken=undefined){
  //retrieve username from token or from submitted login form
  let username = $_oldToken?$_oldToken.username:req.body.loginusername;
  //create sessionID (128bit) and store it into DB
  //TODO: disconnect sockets with old sessionID belonging to the username
  let sessionID = crypto.randomBytes(16).toString('hex');
  pool.query(`UPDATE ${TABLE} SET ${SESSIONID} = ? WHERE ${USERNAME} = ?;`, [sessionID, username], (err)=>{
    if (err){
      new Status({status:'error', file:'db-users.js', func: 'loginResponse()', line: 131/*LL*/, date:misc.DateToString(new Date()), msg: `pool.query() threw an error`, error: err})
                .log(`logging at db-users.js, function loginResponse(), line ${132/*LL*/}`);
      res.status(500).send(JSON.stringify({view: 'errorView', msg: `Maybe the server is down. Error-Code "DB-U:${133/*LL*/}"`}));
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
    //everything seems ok, therefore send username and sessionID as response
    res.status(200).send(JSON.stringify({view: 'canvasView', msg: '', username: username, sessionID: sessionID}));
  });
}



/*
function recoverCredentials(req,res)
description:
  sends an email with a recoverylink to the given emailadress, in case user forgot username or password
arguments:
  req... the request object from a app.post('/recover',(req,res)=>{})
  res... the response object from a app.post('/recover',(req,res)=>{})
return:
  responds by sending 'recoverView' along with the username and sessionID and a new authToken (as http-only-cookie). If something went wrong, the 'errorView' will be sent
*/
function recoverCredentials(req,res){
  if (!validateEmail(req.body.recoveryMail,1,65)){
    res.status(200).send(JSON.stringify({view: 'recoverView', msg: `The submitted email is invalid. Please enter your email adress! Error Code "DB-U:${167/*LL*/}"`}));
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
      new Status({status:'error', file:'db-users.js', func: 'recoverCredentials()', line: 187/*LL*/, date:misc.DateToString(new Date()), msg: `pool.query() threw an error`, error: err})
                .log(`logging at db-users.js, function recoverCredentials(), line ${188/*LL*/}`);
      res.status(200).send(JSON.stringify({view: 'recoverView', msg: `Oups, something went wrong. Maybe the server is down. Error-Code "DB-U:${189/*LL*/}"`}));
      return;
    }    
    //for every username with given email adress...
    sqlResult.forEach((result)=>{
      //...create recoverytoken...
      let recoverUsername = result[USERNAME];
      let recoverID = crypto.randomBytes(16).toString('hex');    
      console.log('created recoverID: ' + recoverID);
      //... and push a promise which resolves after the recoverytoken has been stored to the database and email has been sent  
      promises.push(new Promise((resolve,reject)=>{
        //store recoverytoken in database
        console.log('+1h: ' + (Date.now()+60*60*1000));
        pool.query(`UPDATE ${TABLE} SET ${RECOVERYTOKEN} = ?, ${RECTOKENEXP} = ? WHERE ${USERNAME} = ?;`, [recoverID, (Date.now()+60*60*1000), recoverUsername], (err)=>{
          if (err){
            reject(new Status({status:'error', file:'db-users.js', func: 'recoverCredentials()', line: 204/*LL*/, date:misc.DateToString(new Date()), msg: `pool.query() threw an error`, usermsg: `Oups, something went wrong. Maybe the server is down. Error-Code "DB-U:${204/*LL*/}"`, error: err}));
            return;
          }
          //create email
          let mailOptions = {
            from: MAILSENDERADRESS,
            to: req.body.recoveryMail,
            subject: 'Cardgame Password Reset',
            html: `Hello <b>${recoverUsername}</b>,<br>
            You're receiving this mail because someone (hopefully it was you) has requested to reset the password for your account.<br>
            If you want to reset your password, just click on the following link within 1 hour to complete the process:<br><br>
            <a href="https://${req.headers.host}/reset/${recoverID}">https://${req.headers.host}/reset/${recoverID}</a> <br><br>
            If you did not request this, or remembered your password again and don't want to change it, please ignore this email.<br>
            If you don't click the link, your password will remain unchanged.`
          };
          //send email
          transporter.sendMail(mailOptions, (err,info)=>{
            if (err){
              reject(new Status({status:'error', file:'db-users.js', func: 'recoverCredentials()', line: 222/*LL*/, date:misc.DateToString(new Date()), msg: `transporter.sendMail threw an error`, usermsg: `Oups, something went wrong. Couldn't sent emails. Error-Code "DB-U:${222/*LL*/}"`, error: err}));
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
          res.status(200).send(JSON.stringify({view: 'loginView', msg: `An email has been sent to the given email adress.<br>Please check your mailbox and follow the instructions.<br>You can still use your previous password until you change it.`}));
          return;
      })
      .catch((err)=>{
        err.log(`logging at db-users.js at recoverCredentials(), line ${237/*LL*/}`);
        res.status(500).send(JSON.stringify({view: 'recoverView', msg: err.usermsg}));
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
  let resetID =  req.params.ID;
  if (!name || !password || !passwordconfirmation || !resetID){ //insufficient credentials (must be wrong usage of POSTMAN ;-D), sending reset.html again
    res.status(500).send(JSON.stringify({view: 'resetView', msg: 'Please enter username and password and also confirm the password.'}));
    return;
  }
  if (!misc.validateString(name, MIN_NAME_LENGTH, MAX_NAME_LENGTH, ALLOWED_USER_CHARS)){
    res.status(401).send(JSON.stringify({view: 'resetView', msg: `Reset aborted! The username ${name} is invalid.<br>The username must have between ${MIN_NAME_LENGTH} and ${MAX_NAME_LENGTH} characters.<br>Allowed characters are a-z, A-Z, 0-9, as well as . (DOT), - (MINUS) and _ (UNDERSCORE)`}));
    return;
  }
  if (!misc.validateString(password, MIN_PASS_LENGTH, MAX_PASS_LENGTH)){
    res.status(401).send(JSON.stringify({view: 'resetView', msg: `Reset aborted! The password is invalid.<br>The password must have between ${MIN_PASS_LENGTH} and ${MAX_PASS_LENGTH} characters.`}));
    return;
  }
  if (password !== passwordconfirmation){
    res.status(401).send(JSON.stringify({view: 'resetView', msg: `Reset aborted! The confirmation doesn't match the password. Please re-enter your password and confirm it.`}));
    return;
  }
  if (!misc.validateString(resetID,32,32,HEX_CHARS)){
    res.status(401).send(JSON.stringify({view: 'resetView', msg: `Reset denied! Please click the link in your email again.`}));
    return;
  }
   //credentials seem to be valid strings
  //select all rows, where username matches resetID
  pool.query(`SELECT ${RECTOKENEXP} FROM ${TABLE} WHERE ${USERNAME} = ? AND ${RECOVERYTOKEN} = ?;`, [name, resetID], (err, sqlResult)=>{
    if (err){
      new Status({status:'error', file:'db-users.js', func: 'resetPassword()', line: 286/*LL*/, date:misc.DateToString(new Date()), msg: `pool.query() threw an error`, error: err})
                .log(`logging at db-users.js, function resetPassword(), line ${287/*LL*/}`);
      res.status(500).send(JSON.stringify({view: 'resetView', msg: `Oups, something went wrong. Maybe the server is down. Error-Code "DB-U:${288/*LL*/}"`}));
      return;
    }
    //if no match or time expired
    if (sqlResult.length!==1 || sqlResult[0][RECTOKENEXP]<Date.now()){
      res.status(401).send(JSON.stringify({view: 'resetView', msg: `Reset aborted. You entered the wrong username or the reset-link is expired. You can <a href="/">request another reset link</a>. Error-Code "DB-U:${293/*LL*/}"`}));
      return;
    }
    //resetID is still valid and matches username
    //generate a salt, afterwards hash the password with 10 rounds
    bcrypt.hash(password, 10, (err,hash)=>{
      if (err){
        new Status({status:'error', file:'db-users.js', func: 'resetPassword()', line: 300/*LL*/, date:misc.DateToString(new Date()), msg: `bcrypt.hash() threw an error`, error: err})
                  .log(`logging at db-users.js, function resetPassword(), line ${301/*LL*/}`);
        res.status(500).send(JSON.stringify({view: 'resetView', msg: `Oups, seems like you found a bug! ErrorCode ${302/*LL*/}`}));
        return;
      }
      //update password in database, delete recoveryID and link expiration
      pool.query(`UPDATE ${TABLE} SET ${PASSWORD} = ?, ${RECOVERYTOKEN} = ?, ${RECTOKENEXP} = ? WHERE ${USERNAME} = ?;`, [hash, null, null, name], (err,sqlResult)=>{
        if (err){
          new Status({status:'error', file:'db-users.js', func: 'resetPassword()', line: 308/*LL*/, date:misc.DateToString(new Date()), msg: `pool.query() threw an error`, error: err})
                .log(`logging at db-users.js, function resetPassword(), line ${309/*LL*/}`);
          res.status(500).send(JSON.stringify({view: 'resetView', msg: `Oups, something went wrong. Maybe the server is down. Error-Code "DB-U:${310/*LL*/}"`}));
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
        res.status(200).send(JSON.stringify({view: 'resetView', msg: `You changed your password succesfully. Please <a href="/">log in</a> again!`}));
      });
    });
  });
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
    res.status(401).send(JSON.stringify({view: 'registerView', msg: 'Please enter username and password and also confirm the password. Email is optional.'}));
    return;
  }
  else if (!misc.validateString(name, MIN_NAME_LENGTH, MAX_NAME_LENGTH, ALLOWED_USER_CHARS)){
    res.status(403).send(JSON.stringify({view: 'registerView', msg: `Registration aborted! The username ${name} is invalid.<br>The username must have between ${MIN_NAME_LENGTH} and ${MAX_NAME_LENGTH} characters.<br>Allowed characters are a-z, A-Z, 0-9, as well as . (DOT), - (MINUS) and _ (UNDERSCORE)`}));
    return;
  }
  else if (!misc.validateString(password, MIN_PASS_LENGTH, MAX_PASS_LENGTH)){
    res.status(403).send(JSON.stringify({view: 'registerView', msg: `Registration aborted! The password is invalid.<br>The password must have between ${MIN_PASS_LENGTH} and ${MAX_PASS_LENGTH} characters.`}));
    return;
  }
  else if (password !== passwordconfirmation){
    res.status(403).send(JSON.stringify({view: 'registerView', msg: `Registration aborted! The confirmation doesn't match the password. Please re-enter your password and confirm it.`}));
    return;
  }
  else if (email && !validateEmail(email)){
    res.status(403).send(JSON.stringify({view: 'registerView', msg: 'Registration aborted! The provided emailadress seems to be invalid'}));
    return;
  }
  else{
  //credentials seem to be ok
  // 2) try to register the user
    bcrypt.hash(password, 10, (err,hash)=>{//generate a salt, afterwards hash the password with 10 rounds
      if (err){
        new Status({status:'error', file:'db-users.js', func: 'registerUser()', line: 373/*LL*/, date:misc.DateToString(new Date()), msg: `bcrypt.hash() threw an error`, error: err})
                  .log(`logging at db-users.js, function registerUser(), line ${374/*LL*/}`);
        res.status(500).send(JSON.stringify({view: 'errorView', msg: `Oups, seems like you found a bug! ErrorCode ${375/*LL*/}`}));
        return;
      }
      //successfully hashed, now insert into DB
      pool.query(`INSERT INTO ${TABLE} (${USERNAME}, ${PASSWORD}, ${EMAIL}) VALUES (?, ?, ?);`, [name, hash, email], (err)=>{
        if (err){
          if (err.errno == 1062){ //Tried to insert a duplicate entry bc username is already taken
            res.status(403).send(JSON.stringify({view: 'registerView', msg: `Registration aborted. User '${name}' already exists. Please try another username.`}));
            return;
          }
          new Status({status:'error', file:'db-users.js', func: 'registerUser()', part: '2) trying to register the user', line: 385/*LL*/, date:misc.DateToString(new Date()), msg: `pool.query threw an error, see .error for details`, error: err})
                    .log(`logging at db-users.js, function registerUser(), line ${386/*LL*/}`);
          res.status(500).send(JSON.stringify({view: 'errorView', msg: `Oups, something went wrong! Maybe the database server is down!? ErrorCode ${387/*LL*/}`}));
          return;
        }
        //if a new user registers, create a new entry in player-DB with 0 games and 0 wins
        playerDBscripts.createPlayer(name)
          .then(()=>{
            res.status(200).send(JSON.stringify({view: 'loginView', msg: `Hello ${name}! You registered succesfully.<br>Please log in to play!`}));
            return;
          })
          .catch((err)=>{
            //DEBUG: if the entry of a new Player fails, remove the insertion in the user-table above
            console.log(`error while creating the Player. db-users.js, line ${398/*LL*/}`);
            console.log(err);
            res.status(500).send(JSON.stringify({view: 'errorView', msg: `Registration aborted due to database error.<br> Please mail to TODO:*@*.* or you will not be able to choose your desired username`}));
            return;
          });
        });
    });
  }
}



/*
function validateSessionID(socket)
description:
  checks, if the given sessionID matches the stored sessionID
arguments:
  socket... a socket object created by socket.io
return:
  returns the callback function (which should be next()): 'ok' if the sessionId matches the stored sessionID, else rejects a Status object with the error corresponding message
*/
function validateSessionID(socket){
  if (!misc.validateString(socket.handshake.query.username,MIN_NAME_LENGTH,MAX_NAME_LENGTH,ALLOWED_USER_CHARS) || !misc.validateString(socket.handshake.query.sessionID,32,32,HEX_CHARS)){
    //provided username or sessionID have an invalid format (this should only happen, if someone tries to attack the DB)
    const _err = new Error("not authorized1");
    _err.data = new Status({status:'rejected', warning:'possible attack on DB', file:'db-users.js', func: 'validateSessionID()', line: 424/*LL*/, date:misc.DateToString(new Date()), msg: `username or sessionID not provided or has wrong format`, username: socket.handshake.query.username, sessionID: socket.handshake.query.sessionID, usermsg: `The given username and/or password is invalid. Please try again!`}); //don't change the usermsg, or an attacker could retrieve usernames
    _err.data.log();
    return _err;
  }
  pool.query(`SELECT ${SESSIONID} FROM ${TABLE} WHERE ${USERNAME} = ?;`, socket.handshake.query.username, (err, sqlResult)=>{
    if (err){
      const _err = new Error("not authorized2");
      _err.data = new Status({status:'error', file:'db-users.js', func: 'validateSessionID()', line: 431/*LL*/, date:misc.DateToString(new Date()), msg: `pool.query() threw an error`, usermsg: `Oups, something went wrong. Maybe the server is down. Error-Code "DB-U:${431/*LL*/}"`, error: err});
      return _err;
    }
    if (sqlResult.length === 0){ //no user with given username was found  (this may happens, if a user still has a valid authtoken, but is deleted from the DB - or if someone tries to attack the DB)
      const _err = new Error("not authorized3");
      _err.data = new Status({status:'rejected', warning:'possible attack on DB', file:'db-users.js', func: 'validateSessionID()', line: 436/*LL*/, date:misc.DateToString(new Date()), msg: `username doesn't exist in DB`, username: socket.handshake.query.username, sessionID: socket.handshake.query.sessionID, usermsg: `The given username and/or password is invalid. Please try again!`}); //don't change the usermsg, or an attacker could retrieve usernames
      return _err;
    }
    if (sqlResult[0][SESSIONID].length == 0){
      const _err = new Error("not authorized4");
      _err.data = new Status({status:'rejected', warning:'possible attack on DB', file:'db-users.js', func: 'validateSessionID()', line: 441/*LL*/, date:misc.DateToString(new Date()), msg: `there's no sessionID stored to this username`, username: socket.handshake.query.username, sessionID: socket.handshake.query.sessionID, usermsg: `unknown`});
      return _err;
    }
    if (socket.handshake.query.sessionID !== sqlResult[0][SESSIONID]){ //given sessionID doesn't match stored sessionID
      const _err = new Error("not authorized5");
      _err.data = new Status({status:'rejected', warning:'possible attack on DB', file:'db-users.js', func: 'validateSessionID()', line: 446/*LL*/, date:misc.DateToString(new Date()), msg: `provided sessionID doesn't match stored sessionID "${sqlResult[0][SESSIONID]}"`, username: socket.handshake.query.username, sessionID: socket.handshake.query.sessionID, usermsg: `The given username and/or password is invalid. Please try again!`}); //don't change the usermsg, or an attacker could retrieve usernames

      return _err;
    }
    //sessionID is ok, delete sessionID from DB, to prevent capturing, reuse, etc....  //TODO: don't delete sessionID. rethink this part!
    //pool.query(`UPDATE ${TABLE} SET ${SESSIONID} = ? WHERE ${USERNAME} = ?;`, ['', socket.handshake.query.username], (err,sqlResult)=>{
    //  if (err){
    //    const _err = new Error("not authorized");
    //    _err.data = {status: new Status({status:'error', file:'db-users.js', func: 'validateSessionID()', line: 454/*LL*/, date:misc.DateToString(new Date()), msg: `pool.query() threw an error`, usermsg: `Oups, something went wrong. Maybe the server is down. Error-Code "DB-U:${454/*LL*/}"`, error: err})};
    //    return next(_err);
    //  }
    //  socket.username = socket.handshake.query.username;
    //  return callback(); //callback should usually be next(), which is called here, to avoid promises in the middleware
    //});
    console.log('  --> connection validated');
    return; //delete if uncomment pool.query(...) above  
  });
}




module.exports = (global_pool) => { 
  pool = global_pool;
  return {
  validateCredentials,
  loginResponse,
  recoverCredentials,
  resetPassword,
  registerUser,
  validateSessionID
  }
}