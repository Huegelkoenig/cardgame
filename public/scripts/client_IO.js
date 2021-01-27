//the following code gets executed after the user logged in and is served the game.html
let username;
window.onload = ()=>{
  
  let cardgameSessionCookie = JSON.parse(getCookie('cardgameSession')); //cookie was set immediately before the game.html was sent
  //TODO: rewrite as xmlHttpRequest()... onload(()=>{socket.connect})
  let socket = io('https://huegelkoenig.dynv6.net:8322', {query: {username: cardgameSessionCookie.username, sessionID: cardgameSessionCookie.sessionID}, autoConnect: false, reconnection: true});  //TODO: change host //TODO: send JWT token instead of username and sessionID (??)
  socket.username = cardgameSessionCookie.username;
  document.cookie = "cardgameSession=; max-age=1; sameSite=Strict; __Secure=True;"  // "delete" cookie with session details (for security reasons ? not sure, if this really helps)
  cardgameSessionCookie = ''; // for security reasons (? not sure, if this really helps)  //TODO: check if necesary
  socket.connect(); 
  
  socket.on("connect_error", (err) => {   //This is fired when the server does not accept the connection in a middleware function
    err.data.status.log()    // DEBUG: CHECK! this may interfere with socket.on('error',...) below  (?)
  });

  socket.on('disconnect', (reason)=>{     //for reasons see: https://socket.io/docs/v3/client-socket-instance/
    if (document.getElementById('textfeld') != null){
      document.getElementById('textfeld').innerHTML = `You've been disconnected. See console for details.`;
    }    
    console.log(`socket.io disconnected user ${socket.username} with id ${socket.id} due to`, reason);
    
  });



  socket.on('connectionValidated',()=>{
    initCanvas();
  });

  



  socket.on('error', (error) => {
    if (error == 'userIDtimedout'){
      document.getElementById('textfeld').innerHTML = `Your login has timed out. Please log in again.<br>You will be redirected shortly`;
      socket.disconnect();
      setTimeout(()=>{window.location.replace('login.html')},3000);   
    }
    else{
      console.log('error :>> ', error);
    };
  });



  //sent by the server, just before the client gets disconnected by the server
  socket.on('disconnectionMessage',(msg)=>{
    console.log('socket.id :>> ', socket.id);
    document.cookie = "loginMessage=" + msg + "; max-age=1; sameSite=Strict; __Secure=true;";
    location.replace('/');
  })
  
  document.getElementById('CardgameCanvas').addEventListener('click',()=>{socket.emit('click')});

  
}
  
  


function getCookie(cname) { //from W3schools.com
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}


