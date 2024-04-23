async function connectToSocketIO(response){
  //loadTime = window.performance.timing.domContentLoadedEventEnd-window.performance.timing.navigationStart; 
  //console.log('Page load time is '+ loadTime);
  socket = io('https://huegelkoenig.dynv6.net:8322/', {query: {username: response.username, sessionID: response.sessionID}, autoConnect: false});  //TODO: change host 
  socket.connect();

 
  socket.on("connect_error", (err) => {   //This is fired when the server does not accept the connection in a middleware function
    fullscreenCanvas.hide();
    cardgameCanvas.hide();
    document.getElementById('canvasMsg').hidden = false;    
    document.getElementById('canvasMsg').innerHTML = err.data.usermsg + `<br>There was an error while connecting to the IO-server .<br>Code: client_IO: ` + 16/*LL*/ + '<br><a href="/">Get me back to the login page</a>';
    console.log("socket.on(connect_error) ist:");
    console.log(err.data);
  });


  socket.on('error', (error) => {
    console.log("socket.on(error)");
    if (error == 'userIDtimedout'){
      document.getElementById('canvasMsg').hidden = false;
      document.getElementById('canvasMsg').innerHTML = `Your login has timed out. Please log in again.<br><a href="/">Get me back to the starting page</a>`;
      socket.disconnect(error);
    }
    else{
      console.log('socket.on(error) :>> ', error);
    };
  });

  //TODO:: überarbeiten
  socket.on('disconnect', (reason)=>{     //for reasons see: https://socket.io/docs/v3/client-socket-instance/
    document.getElementById('canvasMsg').hidden = false;
    document.getElementById('canvasMsg').innerHTML = `You've been disconnected. See console for details.`;
    console.log(`socket.io disconnected user ${socket.username} with id ${socket.id} due to`, reason);
    
  });


  //sent by the server, just before the client gets disconnected by the server
  socket.on('disconnectionMessage',(msg)=>{
    document.getElementById('canvasMsg').innerHTML = `${socket.username} with id ${socket.id} has been disconnected, with the following message: <br>` + msg + '<br><a href="/">Get me back to the starting page</a>';    
    document.getElementById('canvasMsg').hidden = false;
  })


  socket.on('connectionValidated',(listOfFilesToLoad)=>{
    scenes['loading'] = new Scene();
    scenes.loading.addToLayer(0, 'greetings', {asset: new TextElement(`Hi ${response.username}`), target: {x:400, y:100}});
    Scene.switchTo('loading');
    gameLoop();
    loadFiles(listOfFilesToLoad);
  });


  socket.on('setPlayerState', (playerState)=>{
    if (playerState>0){
      socket.emit('getGameState');
      return;
    }
    Scene.switchTo('mainMenu');
  });


  socket.on('setGameState', (gameState)=>{
    //TODO: gameState
    //Scene.switchTo('ingame');
  });

  console.log('sockets initialized at ' + DateToString(new Date()));
  return ;
}