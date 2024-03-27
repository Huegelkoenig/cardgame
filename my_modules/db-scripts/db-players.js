//const dotenv = require('dotenv');
//dotenv.config();
const misc = require('../misc/misc.js');
const Status = require('../status/class_status.js');

let pool;

const TABLE = 'players'; //TODO: hardcode these values into the script or dotenv(?)
const PLAYERNAME ='PlayerName';
const INGAME = 'Ingame';
const TOTAL = 'Total';
const WINS = 'Wins';

//const DOMAIN = 'https://localhost:8322';  //TODO: change

const MIN_NAME_LENGTH = 1;
const MAX_NAME_LENGTH = 30;
const MIN_PASS_LENGTH = 3;
const MAX_PASS_LENGTH = 50;
const MAX_EMAIL_LENGTH = 65;
const ALLOWED_USER_CHARS = /[0-9a-z_.-]*/ig; //TODO: get rid of this, allow all user chars
const HEX_CHARS = /[0-9a-f]*/g;






function createPlayer(playerName){
  return new Promise((resolve, reject)=>{
    pool.query(`INSERT INTO ${TABLE} (${PLAYERNAME}, ${INGAME}, ${TOTAL}, ${WINS}) VALUES (?, ?, ?, ?);`, [playerName, 0, 0, 0], (err)=>{
      if (err){
        reject(err);
      }
      resolve(true);
    });
  });
}





function getPlayerState(playerName){
  return new Promise((resolve, reject)=>{
    if (!misc.validateString(playerName, MIN_NAME_LENGTH, MAX_NAME_LENGTH, ALLOWED_USER_CHARS)){
      reject(new Status({status:'error', file:'db-players.js', func: 'getPlayerState()', line: 47/*LL*/, date:misc.DateToString(new Date()), msg: `playerName is invalid string`}));
    }
    pool.query(`SELECT ${INGAME} FROM ${TABLE} WHERE ${PLAYERNAME} = ?;`, playerName, (err, sqlResult)=>{
      if (err){
        reject(new Status({status:'error', file:'db-players.js', func: 'getPlayerState()', line: 51/*LL*/, date:misc.DateToString(new Date()), msg: `pool.query() threw an error`, usermsg: `Oups, something went wrong. Maybe the server is down. Error-Code "DB-U:${51/*LL*/}"`, error: err}));

      }
      if (sqlResult.length === 0){ //no user with given username was found  (this may happens, if a user still has a valid authtoken, but is deleted from the DB - or if someone tries to attack the DB)
        reject(new Status({status:'rejected', warning:'possible attack on DB', file:'db-players.js', func: 'getPlayerState()', line: 55/*LL*/, date:misc.DateToString(new Date()), msg: `player doesn't exist in DB`, username: playername}));
      }
      resolve(sqlResult[0][INGAME]);
    });
  })
}




module.exports = (global_pool) => { 
  pool = global_pool;
  return {
    createPlayer,
    getPlayerState
  }
}