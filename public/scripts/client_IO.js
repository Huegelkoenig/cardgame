//the following code gets executed after the user logged in and is served the game.html
window.onload = ()=>{
  
  let cardgameSessionCookie = JSON.parse(getCookie('cardgameSession')); //cookie was set immediately before the game.html was sent
  let socket = io('https://huegelkoenig.dynv6.net:8322', {query: {username: cardgameSessionCookie.username, sessionID: cardgameSessionCookie.sessionID}, autoConnect: false});  //TODO: change host //TODO: send JWT token instead of username and sessionID
  document.cookie = "cardgameSession=; max-age=1; sameSite=Strict; __Secure=True;"  // "delete" cookie with session details (for security reasons ? not sure, if this really helps)
  cardgameSessionCookie = ''; // for security reasons (? not sure, if this really helps)  //TODO: check if necesary
  socket.connect(); 
  


  socket.on('connectionValidated',()=>{
    initCanvas();
  })





  socket.on('error', (error) => {
    if (error == 'userIDtimedout'){
      document.getElementById('textfeld').innerHTML = `Your login has timed out. Please log in again.<br>You will be redirected shortly`;
      socket.disconnect();
      setTimeout(()=>{window.location.replace('login.html')},3000);   
    }
    else{
      document.getElementById('textfeld').innerHTML = `An error has occured. See console for details.`;
      //socket.disconnect();
      console.log('error :>> ', error);
    };
  });



  //sent by the server, just before the client gets disconnected by the server
  socket.on('disconnectionMessage',(msg)=>{
    document.cookie = "loginMessage=" + msg + "; max-age=1; sameSite=Strict; __Secure=true;";
    location.replace('/');
  })
  //
  socket.on('disconnect', (reason)=>{
    //disconnect may be caused by the client (page refresh, page closed, call of other url,...)
    if (document.getElementById('textfeld') != null){
      document.getElementById('textfeld').innerHTML = `You've been disconnected. See console for details.`;
    }    
    console.log('socket.io disconnect reason :>> ', reason);
    
  });
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


