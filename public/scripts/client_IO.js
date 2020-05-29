//the following code gets executed after the user logged in and is served the game.html
window.onload = ()=>{
  
  let sessionCookie = JSON.parse(getCookie('session'));

  let socket = io('https://localhost:8322', {query: {username: sessionCookie.username, sessionID: sessionCookie.sessionID}, autoConnect: false});
  socket.connect(); 
  

  
  socket.on('connectionValidated',()=>{
    initCanvas();
  })





  socket.on('error', (error) => {
    if (error == 'userIDtimedout'){
      document.getElementById('textfeld').innerHTML = `You're login cookie has timed out. Please log in again.<br>You will be redirected shortly`;
      socket.disconnect();
      setTimeout(()=>{window.location.replace('login.html')},2000);   
    }
    else{
      console.log('error :>> ', error);
    };
  });



  //sent by the server, just before the client gets disconnected by the server
  socket.on('disconnectionMessage',(msg)=>{
    document.cookie = "loginMessage=" + msg+"; max-age=1; sameSite=strict; __Secure=true;";
    location.replace('/');
  })
  //
  socket.on('disconnect',()=>{
    //disconnects by the client (page refresh, page closed, call of other url,...)
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


