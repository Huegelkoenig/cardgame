module.exports = {
  getUserData,
  registerUser,
  getAllData
}

const util = require('util');

const mysql = require('mysql');
let pool = mysql.createPool({
    connectionLimit: 100,
    host     : process.env.DBHOST,
    user     : process.env.DBADMIN,
    password : process.env.DBPASSWORD,
    database : process.env.DATABASE
  });
pool.query = util.promisify(pool.query).bind(pool);


async function getUserData(type, value){
  let getUserDataQuery;
  let sqlresult;
  switch(type){
    case 'username':
      getUserDataQuery = `SELECT * FROM users WHERE UserName = '${value}'`;
      try{
        sqlresult = await pool.query(getUserDataQuery);
        return sqlresult;
      }
      catch (err){
        throw err;
      }
      
    break;

    case 'email':
      // TODO: "email has been sent" etc
    break;

    default:
      console.error('ERROR in userDBScripts.js -> function getUserData -> case default -> type != username || email');
    break;
  }
}
getUserData = util.promisify(getUserData);




    // 1) check if username is valid
    // 1.1) if not: ask for new userdetails and break
    // 2) check if username already exists in DB
    // 2.1) if yes: ask for new userdetails and break
    // 3) check if userdetails are valid
    // 3.1) if not: ask for new userdetails and break
    // 4) register user
 async function registerUser(name, password, email){
  let getUserDataQuery;
  let registerUserQuery;
  let sqlresult;

  // 1) check if username is valid
  if (typeof name === 'string' && name.length>0 && name.match(/[a-z0-9]/ig).length==name.length){
    // 2) check if username already exists in DB
    getUserDataQuery = `SELECT * FROM users WHERE UserName = '${name}'`;
    try{
      sqlresult = await pool.query(getUserDataQuery);
    }
    catch (err){
      throw err;
    }    
    if (typeof sqlresult === 'object' && Array.isArray(sqlresult) && sqlresult.length > 0){
      // TODO: ask for a new username
      console.log('Username already taken, choose another one!');
      return new Promise((resolve,reject)=>{resolve({state: false, message: 'username already exists'})});
    }
    else{
      // TODO: 3) check for valid email and password via checkUserdetails(email, password);
      if (!checkUserDetails(email, password)){
        // TODO: ask for proper email or password
        console.log(' email or password not valid'); // CHANGE
        return;
      }
      else{
        registerUserQuery = `INSERT INTO users (UserName, UserPassword, UserEmail) VALUES ('${name}', '${password}', '${email}');`;
        try{
          sqlresult = await pool.query(registerUserQuery);
        }
        catch (err){
          throw err;
        }
        console.log('new user "' + name + '" added');
        return new Promise((resolve,reject)=>{resolve({state: true})});
        
      }
    }
  }
  else{
    return new Promise((resolve,reject)=>{resolve({state: false, message: 'invalid credentials'})});
  }
}
registerUser = util.promisify(registerUser);
 

function checkUserDetails(email, password){
  // TODO: check if  email (xxx@xxx.xxx) and password (.length<40, utfmb4) are valid
  return true; //
}
    



async function getAllData(){
  let getAllDataQuery = `SELECT * FROM users`;
  let sqlresult;
  try{
    sqlresult = await pool.query(getAllDataQuery);
  } catch (err) {
      throw err;
  }
  return sqlresult;       
}
//getAllData = util.promisify(getAllData);
