window.onload = ()=>{
  document.getElementById('warning').innerHTML = getCookie('loginMessage');



  document.addEventListener('submit',function (evt){
    document.getElementById('warning').innerHTML='Trying to log in! Please wait!';}
  );



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