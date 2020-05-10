let Status = require('../status/class_status.js');
let pool;

const TABLE = 'Users';
const USERNAME ='UserName';
const PASSWORD = 'UserPassword';
const EMAIL = 'UserEmail';
const SESSIONID = 'SessionID';
const SOCKETID = 'SocketID';

const MIN_NAME_LENGTH = 1;
const MAX_NAME_LENGTH = 30;
const MIN_PASS_LENGTH = 3;
const MAX_PASS_LENGTH = 60;
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
      reject(new Status({status:'error', file:'db-users.js', func: 'getUserBy()', line: 40/*LL*/, msg: `TYPO when calling getUserBy(type,...gitup none ): argument 'type' is '${type}', but must be 'name', 'email', 'sessionID' or 'socketID'`, usermsg:"Oups, i'm unable to check the database. There seems to be a typo in my code."}));
      return;
    });
  }
  return new Promise((resolve,reject)=>{
    pool.query(`SELECT ${USERNAME}, ${EMAIL}, ${PASSWORD}, ${SESSIONID}, ${SOCKETID} FROM ${TABLE} WHERE ` + type + ' = ?;', [comparative],
      (err,data)=>{
        if(err){
          reject(new Status({status:'error', file:'db-users.js', func: 'getUserBy()', line: 48/*LL*/, msg: `pool.query threw an error, see .error for details`, usermsg:'Oups, something went wrong! Maybe the database server is down!?', error: err}));
          return;
        }
        resolve({status:'ok', data:data});
        return;
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
function createSalt(length)
description:
  creates a salt consisting of 'length' characters from 0-9, a-z and A-Z
arguments:
  length... the length of the salt
return:
  a salt
*/
function createSalt(length){
  let salt = '';
  for (let i=0; i<length; i++){
    let rand = Math.floor(Math.random()*62);
    if (rand <= 9){
      salt += String.fromCharCode(48+rand);
    }
    else if (rand <= 35){
      salt += String.fromCharCode(65+rand-10);
    }
    else {
      salt += String.fromCharCode(97+rand-36);
    }
  }
  return salt;
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
  nothing, but the user will load a file (TODO: single page application) with a specific message, stating what happened or what went wrong
*/ 
async function registerUser(req,res){
  //1) check if username, password, passwordconfirmation (and email if provided) are valid
  let name = req.body.registerusername;
  let password = req.body.registerpassword;
  let email = req.body.registeremail.length>0?req.body.registeremail:null; //if no email is provided, req.body.registeremail == '' , thus will be set to null
  let passwordconfirmation = req.body.registerpasswordconfirmation;
  if (!name || !password || !passwordconfirmation){ //insufficient credentials (must be wrong usage of POSTMAN ;-D), sending register.html again
    res.cookie('registermessage', 'Please enter username and password and also confirm the password. Email is optional.', {maxAge:1000});
    res.status(200).sendFile('/public/register.html',{root:__dirname+'/../..'});
    return;
  }
  else if (!validateString(name, MIN_NAME_LENGTH, MAX_NAME_LENGTH, ALLOWED_USER_CHARS)){
    res.cookie('registermessage', `Registration aborted! The username ${name} is invalid.<br>The username must have between ${MIN_NAME_LENGTH} and ${MAX_NAME_LENGTH} characters.<br>Allowed characters are a-z, A-Z, 0-9, as well as . (DOT), - (MINUS) and _ (UNDERSCORE)`, {maxAge:1000});
    res.status(401).sendFile('/public/register.html',{root:__dirname+'/../..'});
    return;
  }
  else if (!validateString(password, MIN_PASS_LENGTH, MAX_PASS_LENGTH)){
    res.cookie('registermessage', `Registration aborted! The password is invalid.<br>The password must have between ${MIN_PASS_LENGTH} and ${MAX_PASS_LENGTH} characters.`, {maxAge:1000});
    res.status(401).sendFile('/public/register.html',{root:__dirname+'/../..'});
    return;
  }
  else if (password !== passwordconfirmation){
    res.cookie('registermessage', `Registration aborted! The confirmation doesn't match the password. Please re-enter your password and confirm it.`, {maxAge:1000});
    res.status(401).sendFile('/public/register.html',{root:__dirname+'/../..'});
    return;
  }
  else if (email && !validateEmail(email)){
    res.cookie('registermessage', 'Registration aborted! The provided emailadress seems to be invalid', {maxAge:1000});
    res.status(401).sendFile('/public/register.html',{root:__dirname+'/../..'});
    return;
  }
  else{
//credentials seem to be ok
// 2) try to register the user
    let salt = createSalt(16);
    let registerResult;
    try{
      registerResult = await new Promise(async (resolve,reject)=>{        
        pool.query(`INSERT INTO ${TABLE} (${USERNAME}, ${PASSWORD}, ${EMAIL}, salt) VALUES (?, ?, ?, ?);`, [name, password, email, salt],
          (err,data)=>{
            if (err){
              if (err.errno == 1062){ //Tried to insert a duplicate entry bc username is already taken
                reject(new Status({status:'denied'}));
                return;
              }
              reject(new Status({status:'error', file:'db-users.js', func: 'registerUser()', part: '2) try to register the user', line: 164/*LL*/, msg: `pool.query threw an error, see .error for details`, error: err}));
              return;
            }
            resolve({status: 'ok', data:data});
            return;
        });
      });
    }
    catch(err){
      if (err instanceof Status){ //registration denied due to invalid credentials
        if (err.status == 'denied'){
          res.cookie('registermessage', `Registration aborted. User '${name}' already exists. Please try another username.`, {maxAge:1000});
          res.status(401).sendFile('/public/register.html',{root:__dirname+'/../..'});
          return;
        }
        err.log(`logging at db-users.js, app.post('/',...), line ${179/*LL*/}`);
        res.cookie('registermessage', `Oups, something went wrong! Maybe the database server is down!? ErrorCode ${180/*LL*/}`, {maxAge:1000});
        res.status(401).sendFile('/public/register.html',{root:__dirname+'/../..'});
        return;
      }
      else{ //registration denied due to an error that shouldnt happen... DELETE:???
        new Status({status:'error', file:'db-users.js', func: 'registerUser()', line: 185/*LL*/, msg: 'something went wrong where nothing should went wrong', err: error})
                .log(`logging at db-users.js, registerUser() line ${186/*LL*/}`);
        res.cookie('registermessage',  `Oups, something went wrong! Maybe the database server is down!? ErrorCode ${187/*LL*/}`, {maxAge:1000});
        res.status(401).sendFile('/public/register.html',{root:__dirname+'/../..'});
        return;
      }
    }
    if (registerResult && registerResult.status=='ok'){ //registration succesfull
      res.cookie('registermessage', 'You registered succesfully. You will be redirected to the login page shortly.', {maxAge:1000});
      res.cookie('success', true, {maxAge:1000});
      res.status(200).sendFile('/public/register.html',{root:__dirname+'/../..'});
      return;
    }
    else{ //registration failed, but no error or rejection. This shouldn't happen. DELETE:???
      new Status({status:'error', file:'db-users.js', func:"registerUser()", line:199/*LL*/, msg:"registration wasn't rejected, but registerResult.status!='ok'"})
                .log(`logging at db-users.js, registerUser(), line ${200/*LL*/}`);
      res.cookie('registermessage', `Oups, unable to register. There seems to be something wrong with our database. ErrorCode ${201/*LL*/}`, {maxAge:1000});
      res.status(401).sendFile('/public/register.html',{root:__dirname+'/../..'});
      return;
    }
  }
}





  




module.exports = (global_pool) => { 
  pool = global_pool;
  return {
  getUserBy,
  registerUser,
  validateString
  }
}