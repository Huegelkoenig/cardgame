window.onload = ()=>{
  
  let socket = io('https://localhost:8322', {query: {username: undefined, password:undefined}, autoConnect: false});

  const login_form = document.getElementById('login_form');

  login_form.addEventListener('submit', (evt) => {
    console.log('login :>> ');
    evt.preventDefault();
    socket.query.username = evt.srcElement[0].value;
    socket.query.password = evt.srcElement[1].value;
    //formular.hidden = true;
    socket.connect(); 
  });

};

