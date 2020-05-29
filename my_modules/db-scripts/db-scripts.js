const mysql = require('mysql');
const Status = require('../status/class_status.js');

const pool = mysql.createPool({
    connectionLimit: 100,
    host     : process.env.DBHOST,
    user     : process.env.DBADMIN,
    password : process.env.DBPASSWORD,
    database : process.env.DATABASE
  });

const userDBscripts = require('./db-users.js')(pool);

/*
function getAllFrom(table){
  return new Promise((resolve,reject)=>{
     pool.query(`SELECT * FROM ?`, table, (err,data)=>{
       if(err){
         reject(new Status({status:'error', file:'db-scripts.js', func: 'getAllFrom()', line: 19, msg: `pool.query threw an error`, error: err}));
         return;
       }
       resolve(data);
       return;
    });
})
}
*/



module.exports = {
  validateCredentials: userDBscripts.validateCredentials,
  loginResponse: userDBscripts.loginResponse,
  validateSessionID: userDBscripts.validateSessionID,
  recoverCredentials: userDBscripts.recoverCredentials,
  registerUser: userDBscripts.registerUser,
  
}