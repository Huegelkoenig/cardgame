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


function getUserBy(type, value){
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
      reject(new Status({status:'fault', file:'db-users.js', func: 'getUserBy()', line: 29/*LL*/, msg: `argument 'type' is '${type}', but must be 'name', 'email', 'sessionID' or 'socketID'`}));
    });
  }
  return new Promise((resolve,reject)=>{
    pool.query(`SELECT ${USERNAME}, ${EMAIL}, ${PASSWORD}, ${SESSIONID}, ${SOCKETID} FROM ${TABLE} WHERE ` + type + ' = ?;', [value],
      (err,data)=>{
        if(err){
          reject(new Status({status:'error', file:'db-users.js', func: 'getUserBy()', line: 36/*LL*/, msg: `pool.query threw an error, see .error for details`, error: err}));
        }
        resolve(data);
    });
  });
}


/*
function validateString(string, minLength, maxLength, regexcheck)
description:
  determains if the given string is valid
arguments:
  string... the string to check
  minLength.. the minimum length of the string
  maxLength... the maximum length of the string
  $_regex... (optional) a regular expression for allowed characters to check against
*/
function validateString(string, minLength, maxLength, $_regex = undefined){
  return (string &&  typeof string==='string' && string.length>=minLength && string.length<=maxLength && (!$_regex || ($_regex && string.match(regex).length===string.length)));
}

function validateEmail(email){
  return (email && typeof email==='string' && email.length<=MAX_EMAIL_LENGTH && email.match(/^[0-9a-z]+[0-9a-z._%+]*@[0-9a-z.-]+\.[a-z]{2,}/i).length===email.length && email.match(/[.]{2,}/).length == 0);
}


    // 1) check if username is valid
    // 1.1) if not: ask for new userdetails and break
    // 2) check if username already exists in DB
    // 2.1) if yes: ask for new userdetails and break
    // 3) check if userdetails are valid
    // 3.1) if not: ask for new userdetails and break
    // 4) register user
 function registerUser(name, password, email, passwordconfirmation){
  return new Promise(async (resolve,reject)=>{
    //1) check if username, password, passwordconfirmation and email are valid
    if (!validateString(name, MIN_NAME_LENGTH, MAX_NAME_LENGTH, true)){
      reject(new Status({status:'denied', msg:`The username ${name} is invalid.<br>The username must have between ${MIN_NAME_LENGTH} and ${MAX_NAME_LENGTH} characters.<br>Allowed characters are a-z, A-Z, 0-9, as well as . (DOT), - (MINUS) and _ (UNDERSCORE)`}));
    }
    if (!validateString(password, MIN_PASS_LENGTH, MAX_PASS_LENGTH, false)){
      reject(new Status({status:'denied', msg:`The password is invalid.<br>The password must have between ${MIN_PASS_LENGTH} and ${MAX_PASS_LENGTH} characters.`}));
    }
    if (password !== passwordconfirmation){
      reject(new Status({status:'denied', msg:`The confirmation doesn't match the password. Please re-enter your password and confirm it.`}));
    }
    if (!validateEmail(email)){
      reject(new Status({status:'denied', msg:`The provided email ${email} is invalid.`}));
    }
    //TODO: ab hier
    // 2) check if username already exists in DB
    let sqlresult;
    try{
      sqlresult = await getUserBy('username',name);
    }
    catch (err){
      if (err instanceof Status){ reject(err); }
      reject(new Status({status:'error', file:'db-users.js', func: 'registerUser()', line: 85, part: 'sqlresult = await getUserBy(...)', msg: `an error occured. `, error: err}));
    }
    if (typeof sqlresult === 'object' && Array.isArray(sqlresult) && sqlresult.length == 0){ //no user with this username exists yet
      try{
        pool.query(`INSERT INTO ${TABLE} (${USERNAME}, ${PASSWORD}, ${EMAIL}) VALUES (?, ?, ?);`, [name, password, email],
          (err,data)=>{
            if (err){
              reject(new Status({status:'error', file:'db-users.js', func: 'registerUser(...)', part: 'pool.query', line: 91, msg: `pool.query threw an error`, error: err}));
            }
                resolve({state: true, message: 'you registered succesfully'})
              }
            );
          }
          catch (err){
            throw err;
          }
          console.log('new user "' + name + '" added');
          return new Promise((resolve,reject)=>{resolve({state: true})});

      
    }
    else{
      // TODO: ask for a new username
      console.log('Username already taken, choose another one!');
      resolve({state: false, message: 'username already exists'})
  
    }
  }
);
}



module.exports = (arg) => { 
  pool = arg;
  return {
  getUserBy,
  registerUser,
  validateString
  }
}