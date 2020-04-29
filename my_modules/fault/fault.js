/*
contains:
class Fault: a class for handling errors
*/



/*
class Fault

description:
  a class for handling errors

constructor argument:
  NOTE: only the first argument will be evaluated. Any further arguments will be ignored.
  arg... the argument will be stored as key value pairs inside the Fault object.
         If arg is an Object, key value pairs will be copied from arg,
         if arg is an Array, keys will be the indices of the array,
         else arg will be stored as this.fault
         If no argument is given an Error will be thrown.

methods:
  .log($_msg): logs the (optional) $_msg and the key value pairs to the console
  .callback: a callback function set by the the args
      
example:
function myFunction(arg1,arg2,arg3){
  ...
  try{
    ...this might break
  }
  catch(err){
    //if you don't want to handle the error here...
    throw new Fault({ file:'file.js', function:`myFunction(${arguments})`, line:33, message:'Something went wrong', error:err, throw:false, callback:(val1,val2)=>{doSomethingElse(val1,val2)} });
  }
  ...
}

//...but here (may be in another file)
try{
  myFunction()
}
catch(err){
  if (err instanceof Fault){
    err.log();
    err.callback();
    if (err.throw===true){
        err.throw=false; //if you don't want it to be thrown again
        throw err;
    }
  }
  else{
    console.log('unknown error will be thrown again');
    throw err;
  }
}
*/


class Fault {
  constructor(arg){
    this.callback = ()=>{}; //may be overwritten by arg
    if (arg instanceof Object && Array.isArray(arg)){
      arg.forEach((value,key)=>{this[key] = value});
    }
    else if (arg instanceof Object){
      Object.entries(arg).forEach(([key,value])=>{this[key] = value});
    }
    else if (arg){
      this.fault = arg;
    } else{
      throw new Error('Error creating new Fault object: When creating a new Fault(), an argument must be given!');
    }
  }

  log($_msg){
    console.error('\x1b[31m%s\x1b[0m','vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv');
    console.error('A Fault occured:');
    if($_msg){ console.error('\t' + $_msg) };
    Object.entries(this).map(([key,value])=>{console.error(`  ${key}:\t`,value)});
    console.error('\x1b[31m%s\x1b[0m','^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
  }
}

module.exports = Fault;