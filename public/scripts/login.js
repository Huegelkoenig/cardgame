
document.addEventListener('submit',function (evt){
  console.log('submitting');
  document.getElementById('warning').innerHTML='Trying to log in! Please wait!';}
);


if (document.cookie){
  let warning = getCookie('loginmessage');
  if (warning && warning.length>=1){
    document.getElementById('warning').innerHTML = warning
  }
}



function getCookie(cname) { //from W3schools.com
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}