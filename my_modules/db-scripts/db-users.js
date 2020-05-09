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
  if the string is valid: resolve(true)
  if the string is invalid: reject()
*/
function validateString(string, minLength, maxLength, $_regex = undefined){
  return new Promise((resolve,reject)=>{
    if ((string &&  typeof string==='string' && string.length>=minLength && string.length<=maxLength && (!$_regex || ($_regex && string.match($_regex).length===string.length)))){
      resolve(true);
      return;
    }
    reject(new Status({status:'denied', file:'db-users.js', func:'validateString()', line:77/*LL*/, msg:`The provided string ${string} is invalid.`}));
    return;    
  });
}



/*
function validateEmail(email)
description:
  determains if the given email is valid (non standard emails excluded)
arguments:
  email... string
return:
  if the email is valid: true,  else: false
*/

function validateEmail(email){
  return new Promise((resolve,reject)=>{
    if (email && typeof email==='string' && email.length<=MAX_EMAIL_LENGTH && email.match(/^[0-9a-z]+[0-9a-z._%+]*@[0-9a-z.-]+\.[a-z]{2,}/i)[0]===email && email.match(/[.]{2,}/) === null){
      resolve(true);
      return;
    }
    else{
      reject(new Status({status:'denied', file:'db-users.js', func:'validateEmail', line:101/*LL*/, msg:`The provided email ${email} is invalid.`, usermsg:`The provided email ${email} is invalid.`}));
      return;
    }
  });
}



/*
function registerUser(name, password, email, passwordconfirmation)
description:
  registers a new user if the given credentials are valid und username isn't taken yet
arguments:
  name... a string
  password... a string
  email... a string
  passwordconfirmation... should be the same as email
return:
  true, if the email is valid, false if it isn't
*/
 function registerUser(name, password, email, passwordconfirmation){
  return new Promise(async (resolve,reject)=>{
    //1) check if username, password, passwordconfirmation and email are valid
    try{
      await validateString(name, MIN_NAME_LENGTH, MAX_NAME_LENGTH, ALLOWED_USER_CHARS);
    }
    catch(err){
      if (err instanceof Status){
        err.rethrow(`at db-users.js, registerUser(), line ${130/*LL*/}`);
        err.newUserMsg(`The username ${name} is invalid.<br>The username must have between ${MIN_NAME_LENGTH} and ${MAX_NAME_LENGTH} characters.<br>Allowed characters are a-z, A-Z, 0-9, as well as . (DOT), - (MINUS) and _ (UNDERSCORE)`);
        reject(err);
        return;
      }
      reject(new Status({status:'error', file:'db-users.js', func:'registerUser()', line:135/*LL*/, msg:'error while validating username', usermsg:`Oups, something went wrong.`}));
      return;
    }
    try{
      await validateString(password, MIN_PASS_LENGTH, MAX_PASS_LENGTH);
    }
    catch(err){
      if (err instanceof Status){
        err.rethrow(`at db-users.js, registerUser(), line ${143/*LL*/}`);
        err.newUserMsg(`The password is invalid.<br>The password must have between ${MIN_PASS_LENGTH} and ${MAX_PASS_LENGTH} characters.`);
        reject(err);
        return;
      }
      reject(new Status({status:'error', file:'db-users.js', func:'registerUser()', line:148/*LL*/, msg:'error while validating password', usermsg:`Oups, something went wrong.`}));
      return;
    }
    if (password !== passwordconfirmation){
      reject(new Status({status:'denied', usermsg:`The confirmation doesn't match the password. Please re-enter your password and confirm it.`}));
      return;
    }
    try{
      await validateEmail(email);
    }
    catch(err){
      if (err instanceof Status){
        err.rethrow(`at db-users.js, registerUser(), line ${160/*LL*/}`);
        err.newUserMsg('The provided emailadress is invalid');
        reject(err)
        return;
      }
      reject(new Status({status:'error', file: 'db-users.js', func:'registerUser()', line:165/*LL*/, msg:`validateEmail threw an error, see details below`, usermsg:'Oups, something went wrong', error: err}));
      return;
    }
    // 2) check if username already exists in DB
    let sqlresult;
    try{
      sqlresult = await getUserBy('name',name);
    }
    catch(err){ // some error occured while querying the DB
      if (err instanceof Status){
        err.rethrow(`at db-users.js, registerUser(), line ${175/*LL*/}`);
        err.newUserMsg('Oups, something went wrong! Maybe the database server is down!?');
        reject(err);
        return;
      }
      reject(new Status({status:'error', file:'db-users.js', func: 'registerUser()', line: 180/*LL*/, part: '2) check username', msg: `an error occured, see .error for details`, usermsg:'Oups, something went wrong! Maybe the database server is down!?', error: err}));
      return;
    }
    if (typeof sqlresult !== 'object' || !Array.isArray(sqlresult.data)){ //query returned wrong datatype
      reject (new Status({status:'error', file:'db-users.js', func: 'registerUser()', line: 184/*LL*/, msg: `sqlresult has wrong datatype`, usermsg:'Oups, something went wrong!', sqlresult: sqlresult}));
      return;
    }
    if (sqlresult.data.length >= 1){//username is already taken
      reject (new Status({status:'denied', file:'db-users.js', func: 'registerUser()', line: 188/*LL*/, msg: `User ${name} already exists. Please try another one.`, usermsg:`User ${name} already exists. Please try another one.`}));
      return;
    }
    //3) everything seems ok, register user
    pool.query(`INSERT INTO ${TABLE} (${USERNAME}, ${PASSWORD}, ${EMAIL}) VALUES (?, ?, ?);`, [name, password, email],
      (err,data)=>{
        if (err){
          reject(new Status({status:'error', file:'db-users.js', func: 'registerUser(...)', part: '3) register user', line: 195/*LL*/, msg: `pool.query threw an error, see .error for details`, error: err}));
          return;
        }
        resolve({status: 'ok', data:data});
        return;
    });
  });
}



module.exports = (global_pool) => { 
  pool = global_pool;
  return {
  getUserBy,
  registerUser,
  validateString
  }
}