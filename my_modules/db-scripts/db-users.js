

let pool;

const TABLE = 'users';
const USERNAME ='UserName';
const EMAIL = 'UserEmail';
const SESSIONID = 'SessionID';


function getUserBy(type,value){
  switch (type){
    case 'name': type = USERNAME;
    break;
    case 'email': type = EMAIL;
    break;
    case 'sessionID': type = SESSIONID;
    break;
    default: throw new Error('PROGRAMMIERUNGSFEHLER! type must be \'name\', \'email\' or \'sessionID\'');
  }
  return new Promise((resolve,reject)=>{
    pool.query(`SELECT * FROM ${TABLE} WHERE ` + type + ` = ?;`,[value], (err,data)=>{if(err){reject(err)}; resolve(data);});
  });
}





    // 1) check if username is valid
    // 1.1) if not: ask for new userdetails and break
    // 2) check if username already exists in DB
    // 2.1) if yes: ask for new userdetails and break
    // 3) check if userdetails are valid
    // 3.1) if not: ask for new userdetails and break
    // 4) register user
 async function registerUser(name, password, email){
   return new Promise(async (resolve)=>{
  let sqlresult;

  // 1) check if username is valid
  if (typeof name === 'string' && name.length>0 && name.match(/[a-z0-9]/ig).length==name.length){
    // 2) check if username already exists in DB
    try{
      sqlresult = await getUserBy('username',name);
    }
    catch (err){
      throw err;
    }    
    if (typeof sqlresult === 'object' && Array.isArray(sqlresult) && sqlresult.length > 0){
      // TODO: ask for a new username
      console.log('Username already taken, choose another one!');
      resolve({state: false, message: 'username already exists'})
    }
    else{
      // TODO: 3) check for valid email and password via checkUserdetails(email, password);
      if (!checkUserDetails(email, password)){
        // TODO: ask for proper email or password
        console.log(' email or password not valid'); // CHANGE
        return;
      }
      else{
        try{
          pool.query(`INSERT INTO ${TABLE} (UserName, UserPassword, UserEmail) VALUES (?, ?, ?);`,[name, password, email],(err,data)=>{
            if (err){
              throw(err);
            }
            resolve({state: true, message: 'you registered succesfully'})
          });
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
});
}
 

function checkUserDetails(email, password){
  // TODO: check if  email (xxx@xxx.xxx) and password (.length<40, utfmb4) are valid
  return true; //
}
    







module.exports = (argpool) => { 
  pool = argpool;
  return {
  getUserBy,
  registerUser
  }
}