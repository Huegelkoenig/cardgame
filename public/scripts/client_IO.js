//the following code gets executed after the user logged in
//this way, we  prevent socket to be a global variable
//but can't call socket.emit from outside!?!
var loadTime;
function connectToSocketIO(response){
  //loadTime = window.performance.timing.domContentLoadedEventEnd-window.performance.timing.navigationStart; 
  //console.log('Page load time issss '+ loadTime);
  let socket = io('https://localhost:8322', {query: {username: response.username, sessionID: response.sessionID}, autoConnect: false});  //TODO: change host 
  //socket.username = response.username;
  socket.connect(); 
  

  socket.on("connect_error", (err) => {   //This is fired when the server does not accept the connection in a middleware function
    err.data.status.log()    // DEBUG: CHECK if this interferes with socket.on('error',...) below  (?)
    document.getElementById('canvasMsg').hidden = true;
    document.getElementById('canvasMsg').innerHTML = `There was an connection error. Code: client_IO: ` + 17/*LL*/;
    console.log(`connect_error due to ${err.message}`);
  });

  socket.on('error', (error) => {
    if (error == 'userIDtimedout'){
      document.getElementById('canvasMsg').hidden = false;
      document.getElementById('canvasMsg').innerHTML = `Your login has timed out. Please log in again.<br><a href="/">Get me back to the starting page</a>`;
      socket.disconnect(error);
    }
    else{
      console.log('socket.on(error) :>> ', error);
    };
  });


  socket.on('disconnect', (reason)=>{     //for reasons see: https://socket.io/docs/v3/client-socket-instance/
    document.getElementById('canvasMsg').hidden = false;
    document.getElementById('canvasMsg').innerHTML = `You've been disconnected. See console for details.`;
    console.log(`socket.io disconnected user ${socket.username} with id ${socket.id} due to`, reason);
    
  });


   socket.on('connectionValidated',()=>{
    document.getElementById('canvasMsg').hidden = false;
    document.getElementById('canvasMsg').innerHTML = 'SOCKETIO connection validated. Initializing canvas.<br>If you can see this, theres somethin wrong.<br><a href="/">Please reload the page</a>';
    initCanvas(response);
    //for testing
  document.getElementById('cardgameCanvas').addEventListener('click',(evt)=>{console.log('x: ', evt.x, 'y: ', evt.y, 'ratio: ', ratio); socket.emit('click',(evt.x-rect.left)/ratio,(evt.y-rect.top)/ratio)});
  window.addEventListener('keydown',(evt)=>{console.log('evt :>> ', evt); socket.emit('key', evt.key)});
  });

  




  //sent by the server, just before the client gets disconnected by the server
  socket.on('disconnectionMessage',(msg)=>{
    document.getElementById('canvasMsg').innerHTML = `${socket.username} with id ${socket.id} has been disconnected, with the following message: <br>` + msg + '<br><a href="/">Get me back to the starting page</a>';    

  })
  
}

