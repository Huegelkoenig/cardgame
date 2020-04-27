window.onload = ()=>{

  let socket = io('https://localhost:8322', {query: {userID: undefined}, autoConnect: false});
  document.getElementById('game').innerHTML = "here's the game";


  xhttp = new XMLHttpRequest();
  xhttp.open("POST", "/", true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send();
  xhttp.onreadystatechange = function() {
    if(this.readyState == 4) {
      let sessionID = JSON.parse(xhttp.response).sessionID;  //answer from server
      let token = JSON.parse(xhttp.response).token;
      console.log('xhttp.response: ', sessionID); //sessionID is the name of the key, which is specified in server.js on POST '/' with valid token
      console.log('xhttp.response: ', token); //not sure if this must be sent again to user, see server.js
      //overwrite user credentials
      socket.query.sessionID = sessionID;
      socket.query.token = token;
      socket.connect(); 
      //well, javascript could be haltet at the lines above be developer tools, but i think its saver to delete these her
      xhttp = undefined;
      socket.query.sessionID = undefined;
      socket.query.token = undefined
      
    }
    else {
      document.getElementById('textfeld').innerHTML = 'Access not allowed yet'; 
    }
    
  }



  socket.on('error', (error) => {
    if (error == 'userIDtimedout'){
      document.getElementById('textfeld').innerHTML = `You're login cookie has timed out. Please log in again.<br>You will be redirected shortly`;
      socket.disconnect();
      setTimeout(()=>{window.location.replace('login.html')},2000);   
    };
  });



}

