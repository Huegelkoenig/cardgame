class Fault {
  constructor(arg){
    if (arg){
      Object.entries(arg).map(([key,value])=>{this[key] = value});
    }
    else{
      throw new Error('Error creating new Fault object: When creating a new Fault, an argument must be given!');
    }    
  }

  clog(arg){
    console.error('\x1b[31m%s\x1b[0m','vvvvvvvvvvv');
    console.error('A Fault occured at');
    if(arg){ console.error('\t' + arg) };
    Object.entries(this).map(([key,value])=>{console.error(`  ${key}:\t`,value)});
    console.error('\x1b[31m%s\x1b[0m','^^^^^^^^^^^');
  }
}




module.exports = {
  Fault
};