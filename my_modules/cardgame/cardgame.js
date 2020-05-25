function init(socket){
  //app here

  socket.emit('connectionValidated');

/* //just for testing
  let hijackcount=0;
  socket.on('hijackthis',()=>{
    hijackcount++;
    console.log('hijacked ', hijackcount);
    if (hijackcount>=3){
      socket.emit('disconnectionMessage','you were disconnected' +hijackcount);
     socket.disconnect(true);
    }});
*/
}

module.exports = {init};