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
      reject(new Status({status:'fault', file:'db-users.js', func: 'getUserBy()', line: 40/*LL*/, msg: `argument 'type' is '${type}', but must be 'name', 'email', 'sessionID' or 'socketID'`}));
    });
  }
  return new Promise((resolve,reject)=>{
    pool.query(`SELECT ${USERNAME}, ${EMAIL}, ${PASSWORD}, ${SESSIONID}, ${SOCKETID} FROM ${TABLE} WHERE ` + type + ' = ?;', [comparative],
      (err,data)=>{
        if(err){
          reject(new Status({status:'error', file:'db-users.js', func: 'getUserBy()', line: 47/*LL*/, msg: `pool.query threw an error, see .error for details`, error: err}));
        }
        else{
          resolve(data);
        }
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
  if the string is valid: true,  else: false
*/

function validateString(string, minLength, maxLength, $_regex = undefined){
  return new Promise((resolve,reject)=>{
    if ((string &&  typeof string==='string' && string.length>=minLength && string.length<=maxLength && (!$_regex || ($_regex && string.match($_regex).length===string.length)))){
      resolve(true);
    }
    else{
      reject(false);
    }
    
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
      resolve({status:'ok'});
    }
    else{
      console.log('99/*LL*/ :>> ', email + 99/*LL*/);
      reject('false fffffff'+95);
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
      reject(new Status({status:'denied', msg:`The username ${name} is invalid.<br>The username must have between ${MIN_NAME_LENGTH} and ${MAX_NAME_LENGTH} characters.<br>Allowed characters are a-z, A-Z, 0-9, as well as . (DOT), - (MINUS) and _ (UNDERSCORE)`}));
    }
    try{
      await validateString(password, MIN_PASS_LENGTH, MAX_PASS_LENGTH);
    }
    catch(err){
      reject(new Status({status:'denied', msg:`The password is invalid.<br>The password must have between ${MIN_PASS_LENGTH} and ${MAX_PASS_LENGTH} characters.`}));
    }
    if (password !== passwordconfirmation){
      reject(new Status({status:'denied', msg:`The confirmation doesn't match the password. Please re-enter your password and confirm it.`}));
    }
    try{
      await validateEmail(email);
    }
    catch(err){
      reject(new Status({status:'denied', msg:`The provided email ${email} is invalid.`}));
    }
    // 2) check if username already exists in DB
    let sqlresult;
    try{
      sqlresult = await getUserBy('name',name);
    }
    catch(err){ // some error occured while querying the DB
      if (err instanceof Status){
        err.addRethrow(`rethrown at db-users.js, registerUser(), line ${151/*LL*/}`);
        reject(err);
      }
      reject(new Status({status:'error', file:'db-users.js', func: 'registerUser()', line: 154/*LL*/, part: '2) check username', msg: `an error occured, see .error for details`, error: err}));
    }
    if (typeof sqlresult !== 'object' || !Array.isArray(sqlresult)){ //query returned wrong datatype
      reject (new Status({status:'error', file:'db-users.js', func: 'registerUser()', line: 157/*LL*/, msg: `sqlresult has wrong datatype`, sqlresult: sqlresult}));
    }
    else if (sqlresult.length >= 1){//username is already taken
      reject (new Status({status:'denied', file:'db-users.js', func: 'registerUser()', line: 160/*LL*/, msg: `User ${name} already exists. Please try another one.`}));
    }
    //3) everything seems ok, register user
    pool.query(`INSERT INTO ${TABLE} (${USERNAME}, ${PASSWORD}, ${EMAIL}) VALUES (?, ?, ?);`, [name, password, email],
      (err,data)=>{
        if (err){
          reject(new Status({status:'error', file:'db-users.js', func: 'registerUser(...)', part: '3) register user', line: 166/*LL*/, msg: `pool.query threw an error, see .error for details`, error: err}));
        }
        resolve({status: 'ok'});
    });
  });
}



module.exports = (arg) => { 
  pool = arg;
  return {
  getUserBy,
  registerUser,
  validateString
  }
}