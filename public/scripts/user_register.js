window.onload = ()=>{

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



  document.getElementById('msg').innerHTML = getCookie('registerMessage');
  if (getCookie('success') == 'true'){
    setTimeout(()=>{window.location.replace('login.html')},2000);
  }
  

  
  let pw = document.getElementById('pw');
  let pwc = document.getElementById('pwc');
  pw.addEventListener('keyup', validatePW);
  pwc.addEventListener('keyup', validatePW);
  function validatePW(){
    if (pw.value === pwc.value){
      document.getElementById('submit').disabled = false;
      pwc.style.backgroundColor = '#FFFFFF';
      document.getElementById('msg').innerHTML = '<br>';
    }
    else{
      document.getElementById('submit').disabled = true;
      pwc.style.backgroundColor = '#e34f52';
      document.getElementById('msg').innerHTML = 'passwords missmatch';
    }
  }

}