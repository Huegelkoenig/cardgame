function init(socket){
  //app here
  socket.emit('startDDoS');
  let count=0;
  //may do this in a io.use((socket,next)=>{})
  socket.on('testDDoS',()=>{
                            count++;
                            if (count%1000==0){
                              console.log('DDoS status :>> ', count);
                            };
                            if (count>2001){
                              socket.emit('show');
                            }
  });

  let hijackcount=0;
  socket.on('hijackthis',()=>{
    hijackcount++;
    console.log('hijacked ', hijackcount);
    if (hijackcount>=3){
      socket.emit('disconnectionMessage','you were disconnected' +hijackcount);
     socket.disconnect(true);
    }});
}

module.exports = {init};