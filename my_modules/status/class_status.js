/*
contains:
class Status: a class to store a status
*/



/*
class Status

description:
  a class to store a status, e.g. throw an Error along with additional information

constructor argument:
  NOTE: only the first argument will be evaluated. Any further arguments will be ignored.
  arg... the argument will be stored as key value pairs inside the Status object.
         If arg is an Object, key value pairs will be copied from arg,
         if arg is an Array, keys will be the indices of the array,
         else arg will be stored as this.Status
         If no argument is given an Error will be thrown.

methods:
  .log(...): logs the (optional) arguments first and then the key value pairs stored in this object to the console
             Each status.log will be surrounded by colored seperators.
             If this.status=='error' (=='Fault', =='warning') the color will be changed to red (light red, yellow), standard is blue.
      
example:
function myFunction(arg1,arg2,arg3){
  ...
  try{
    ...this might break
  }
  catch(err){
    //if you don't want to handle the error here...
    throw new Status({status:'error' file:'file.js', function:`myFunction(${arguments})`, line:33, message:'Something went wrong', error:err, throw:false, callback:(val1,val2)=>{doSomethingElse(val1,val2)} });
  }
  ...
}

//...but here (may be in another file)
try{
  myFunction()
}
catch(err){
  if (err instanceof Status){
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


class Status {
  constructor(arg){
    if (arguments.length>1){
      throw new Status({status:'warning', file:'status.js', func:'constructor() of class Status', msg:'Warning: you submitted more than 1 arguments. Only the first Argument will be evaluated.'});
    }
    if (arg instanceof Object && Array.isArray(arg)){
      arg.forEach((value,key)=>{this[key] = value});
    }
    else if (arg instanceof Object){
      Object.entries(arg).forEach(([key,value])=>{this[key] = value});
    }
    else if (arg){
      this.msg = arg;
    } else{
      throw new Status({status:'error', file:'status.js', func:'constructor()', msg:'Error while creating a new Status object! No arguments were given!'});
    }
  }

  log(...args){
    let clog=console.log;
    let color='\x1b[1;34m%s\x1b[0m'; //blue
    if (this.status=='error'){
      color='\x1b[31m%s\x1b[0m'; //red
      clog=console.error;
      args.unshift('An Error occured!');
    }
    if (this.status=='fault'){
      color='\x1b[1;31m%s\x1b[0m'; //light red
      clog=console.error;
      args.unshift('A Fault occured!');
    }
    if (this.status=='warning'){
      color='\x1b[33m%s\x1b[0m'; //yellow
      clog=console.warn;
      args.unshift('Warning!');
    }
    clog(color,'vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv');
    args.forEach(arg=>{clog('   ' + arg)});    
    Object.entries(this).forEach(([key,value])=>{clog(`\t${key}:\t`,value)});
    clog(color,'^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
  }

  addRethrow(msg){
    let errordummy;
    let i=1;
    if (this.error){
      errordummy = this.error;
      delete this.error;
    }
    while (this['rethrow'+i]){
      i++;
    }
    this['rethrow'+i] = msg;
    this.error = errordummy;
  }
}

module.exports = Status;