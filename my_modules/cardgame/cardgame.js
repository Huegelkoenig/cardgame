const misc = require('../misc/misc.js')

function init(socket){
  //app here

  socket.emit('connectionValidated');

  socket.on('disconnect', (reason)=>{
    console.log(`${misc.DateToString(new Date())}: User ${socket.handshake.query.username} disconnected`);
    console.log('reason :>> ', reason);
  })
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