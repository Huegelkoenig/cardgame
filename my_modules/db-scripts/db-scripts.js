const mysql = require('mysql');
const Status = require('../status/class_status.js');

const pool = mysql.createPool({
    connectionLimit: 100,
    host     : process.env.DBHOST,
    user     : process.env.DBADMIN,
    password : process.env.DBPASSWORD,
    database : process.env.DATABASE
  });

let userDBscripts = require('./db-users.js')(pool);


function getAllFrom(table){
  return new Promise((resolve,reject)=>{
     pool.query(`SELECT * FROM ?`, table, (err,data)=>{
       if(err){
         reject(new Status({status:'error', file:'db-scripts.js', func: 'getAllFrom()', line: 27/*LL*/, part: 'pool.query', msg: `pool.query threw an error`, error: err}));
       };
       resolve(data);
    });
})
}

/*
/// testing
(
  async function(){
  try{
    console.log('answer\n',await userDBscripts.getUserBy('name','a'));
  }
  catch(err){
    if (err instanceof Status){
      err.log();
    }
    else{throw(err)}
  }})();
/// end testing
*/

module.exports = {
  getUserBy: userDBscripts.getUserBy,
  registerUser: userDBscripts.registerUser,
  getAllFrom: getAllFrom
}