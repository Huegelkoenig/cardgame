const bcrypt = require('bcrypt');
const Status = require('../status/class_status.js');

let pool;

const TABLE = 'Users'; //TODO: hardcode these values into the script (?)
const USERNAME ='UserName';
const PASSWORD = 'UserPassword';
const EMAIL = 'UserEmail';
const SESSIONID = 'SessionID';
const SOCKETID = 'SocketID';
const SALT = 'salt'

const MIN_NAME_LENGTH = 1;
const MAX_NAME_LENGTH = 30;
const MIN_PASS_LENGTH = 3;
const MAX_PASS_LENGTH = 50;
const MAX_EMAIL_LENGTH = 65;
const ALLOWED_USER_CHARS = /[0-9a-z_.-]/ig;


/*
function getUserBy(type, comparative)
description:
  gets user data from the users table in the database 
arguments:
  type... the string 'name', 'email', 'sessionID' or 'socketID' to compare for
  comparative... the comparative
return:
  returns a promise, which resolves the result of the databse query in an object {status:'ok', data:data}, rejects on errors
*/
function getUserBy(type, comparative){
  switch (type){
    case 'name': type = USERNAME;
    break;
    case 'email': type = EMAIL;
    break;
    case 'sessionID': type = SESSIONID;
    break;
    case 'socketID': type = SESSIONID;
    break;
    default: return new Promise((resolve,reject)=>{
      reject(new Status({status:'error', file:'db-users.js', func: 'getUserBy()', line: 43/*LL*/, msg: `TYPO when calling getUserBy(type,...gitup none ): argument 'type' is '${type}', but must be 'name', 'email', 'sessionID' or 'socketID'`, usermsg:"Oups, i'm unable to check the database. There seems to be a typo in my code."}));
      return;
    });
  }
  return new Promise((resolve,reject)=>{
    pool.query(`SELECT ${USERNAME}, ${EMAIL}, ${PASSWORD}, ${SESSIONID}, ${SOCKETID} FROM ${TABLE} WHERE ` + type + ' = ?;', [comparative],
      (err,data)=>{
        if(err){
          reject(new Status({status:'error', file:'db-users.js', func: 'getUserBy()', line: 51/*LL*/, msg: `pool.query threw an error, see .error for details`, usermsg:'Oups, something went wrong! Maybe the database server is down!?', error: err}));
          return;
        }
        resolve({status:'ok', data:data});
        return;
    });
  });
}




function loginResponse(req, res, $_token=undefined){ //TODO:!!!!
  
  //create sessionID and store it into DB where token.username (128bit)
  //set (refresh) cookie cardgameAuthToken
  //set cookie with sessionID
  //send file game.html

/*
  console.log('req.username :>> ', req.username);
  //set cookie again to extend expiration date
  res.cookie('cardgameAuthToken', req.cookies.cardgameAuthToken, {
    maxAge: 5 * 1000,     // would expire after x seconds  (x * 1000) TODO: adjust maxAge to e.g 24h
    httpOnly: true,       // the cookie is only accessible by the web server
    sameSite:'Strict',
    secure: true,         // send only via https
    domain: DOMAIN,       
    path: '/'
  });
  //SET another COOKIE with username and sessionID here and send it along!!!
  res.status(200).sendFile(__dirname + '/private/game.html'); //TODO:
  return;
  */
}


function validateCredentials(req,res){
  if (!req.body.loginusername || !req.body.loginpassword || !(typeof req.body.loginusername === "string") || !(typeof req.body.loginpassword === "string")){
    res.cookie('loginMessage', `The submitted data is corrupted. Please enter your username and password again! Error Code "DB-U:${89/*LL*/}"`, {maxAge:1000, sameSite:'Strict', secure:true});
    res.status(401).sendFile('/public/login.html',{root:__dirname+'/../..'});
    return;
  }
  pool.query(`SELECT ${PASSWORD} FROM ${TABLE} WHERE ${USERNAME} = ?;`, req.body.loginusername, (err, sqlResult)=>{
    if (err){
      new Status({status:'error', file:'db-users.js', func: 'validateCredentials()', line: 96/*LL*/, date:DateToString(new Date()), msg: `pool.query() threw an error`, error: err})
                .log(`logging at db-users.js, function validateCredentials(), line ${97/*LL*/}`);
    }
    if (err || data.length !== 1){
      res.cookie('loginMessage', `The given username and/or password is incorrect. Please try again`, {maxAge:1000, sameSite:'Strict', secure:true});
      res.status(401).sendFile('/public/login.html',{root:__dirname+'/../..'});
      return;
    }
    bcrypt.compare(req.body.loginpassword, sqlResult.data[0][PASSWORD], (err,result)=>{
      if (err){
        res.cookie('loginMessage', `The given username and/or password is incorrect. Please try again`, {maxAge:1000, sameSite:'Strict', secure:true});
        res.status(401).sendFile('/public/login.html',{root:__dirname+'/../..'});
        return;
      }
      loginResponse(req,res);
    });
  });
}


/*
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
    res.cookie('registerMessage', 'Please enter username and password and also confirm the password. Email is optional.', {maxAge:1000, sameSite:'Strict', secure:true});
    res.status(200).sendFile('/public/register.html',{root:__dirname+'/../..'});
    return;
  }
  else if (!validateString(name, MIN_NAME_LENGTH, MAX_NAME_LENGTH, ALLOWED_USER_CHARS)){
    res.cookie('registerMessage', `Registration aborted! The username ${name} is invalid.<br>The username must have between ${MIN_NAME_LENGTH} and ${MAX_NAME_LENGTH} characters.<br>Allowed characters are a-z, A-Z, 0-9, as well as . (DOT), - (MINUS) and _ (UNDERSCORE)`, {maxAge:1000, sameSite:'Strict', secure:true});
    res.status(401).sendFile('/public/register.html',{root:__dirname+'/../..'});
    return;
  }
  else if (!validateString(password, MIN_PASS_LENGTH, MAX_PASS_LENGTH)){
    res.cookie('registerMessage', `Registration aborted! The password is invalid.<br>The password must have between ${MIN_PASS_LENGTH} and ${MAX_PASS_LENGTH} characters.`, {maxAge:1000, sameSite:'Strict', secure:true});
    res.status(401).sendFile('/public/register.html',{root:__dirname+'/../..'});
    return;
  }
  else if (password !== passwordconfirmation){
    res.cookie('registerMessage', `Registration aborted! The confirmation doesn't match the password. Please re-enter your password and confirm it.`, {maxAge:1000, sameSite:'Strict', secure:true});
    res.status(401).sendFile('/public/register.html',{root:__dirname+'/../..'});
    return;
  }
  else if (email && !validateEmail(email)){
    res.cookie('registerMessage', 'Registration aborted! The provided emailadress seems to be invalid', {maxAge:1000, sameSite:'Strict', secure:true});
    res.status(401).sendFile('/public/register.html',{root:__dirname+'/../..'});
    return;
  }
  else{
  //credentials seem to be ok
  // 2) try to register the user
    bcrypt.hash(password, 10, (err,hash)=>{//generate a salt, afterwards hash the password with 10 rounds
      if (err){
        new Status({status:'error', file:'db-users.js', func: 'registerUser()', line: 237/*LL*/, date:DateToString(new Date()), msg: `bcrypt.hash() threw an error`, error: err})
                  .log(`logging at db-users.js, function registerUser(), line ${238/*LL*/}`);
        res.cookie('registerMessage', `Oups, seems like you found a bug! ErrorCode ${239/*LL*/}`, {maxAge:1000, sameSite:'Strict', secure:true});
        res.status(401).sendFile('/public/register.html',{root:__dirname+'/../..'});
        return;
      }
      //successfully hashed, now insert into DB
      pool.query(`INSERT INTO ${TABLE} (${USERNAME}, ${PASSWORD}, ${EMAIL}) VALUES (?, ?, ?);`, [name, hash, email], (err,result)=>{
        if (err){
          if (err.errno == 1062){ //Tried to insert a duplicate entry bc username is already taken
            res.cookie('registerMessage', `Registration aborted. User '${name}' already exists. Please try another username.`, {maxAge:1000, sameSite:'Strict', secure:true});
            res.status(401).sendFile('/public/register.html',{root:__dirname+'/../..'});
            return;
          }
          new Status({status:'error', file:'db-users.js', func: 'registerUser()', part: '2) try to register the user', line: 251/*LL*/, date:DateToString(new Date()), msg: `pool.query threw an error, see .error for details`, error: err})
                    .log(`logging at db-users.js, function registerUser(), line ${252/*LL*/}`);
          res.cookie('registerMessage', `Oups, something went wrong! Maybe the database server is down!? ErrorCode ${253/*LL*/}`, {maxAge:1000, sameSite:'Strict', secure:true});
          res.status(401).sendFile('/public/register.html',{root:__dirname+'/../..'});
          return;
        }
        res.cookie('registerMessage', 'You registered succesfully. You will be redirected to the login page shortly.', {maxAge:1000, sameSite:'Strict', secure:true});
        res.cookie('success', true, {maxAge:1000, sameSite:'Strict', secure:true});
        res.status(200).sendFile('/public/register.html',{root:__dirname+'/../..'});
        return;
      });
    });
  }
}



module.exports = (global_pool) => { 
  pool = global_pool;
  return {
  getUserBy,
  loginResponse,
  registerUser,
  validateString,
  validateCredentials
  }
}