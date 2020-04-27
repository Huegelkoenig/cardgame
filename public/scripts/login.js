formular.addEventListener('submit', (evt) => {
  evt.preventDefault();
  socket.query.username = evt.srcElement[0].value;
  document.getElementById('errormessage').innerHTML = '';
  formular.hidden = true;
  socket.connect(); 
});