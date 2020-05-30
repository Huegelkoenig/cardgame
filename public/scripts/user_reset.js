window.onload = ()=>{

  document.getElementById('msg').innerHTML = getCookie('cardgameResetMessage');


  //check if password and passwordConfirmation are equal
  let npw = document.getElementById('npw');
  let npwc = document.getElementById('npwc');
  npw.addEventListener('keyup', validatePW);
  npwc.addEventListener('keyup', validatePW);
  function validatePW(){
    if (npw.value === npwc.value){
      document.getElementById('submit').disabled = false;
      npwc.style.backgroundColor = '#FFFFFF';
      document.getElementById('msg').innerHTML = '<br>';
    }
    else{
      document.getElementById('submit').disabled = true;
      npwc.style.backgroundColor = '#e34f52';
      document.getElementById('msg').innerHTML = 'passwords missmatch';
    }
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

}