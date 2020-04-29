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

function getAllData(table){
  return new Promise((resolve)=>{
    try{
      pool.query(`SELECT * FROM ?`, table, (err,data)=>{ if(err){
        throw err}; resolve(data); });
    }
    catch (err) {
      throw err;
    }     
  });
}


module.exports = {
  getUserBy: userDBscripts.getUserBy,
  registerUser: userDBscripts.registerUser,
  getAllData: getAllData
}
