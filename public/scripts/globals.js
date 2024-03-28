var fullscreenCanvas;
var cardgameCanvas;
var scale;

var socket;

var inputs;
var graphics = {};

var scenes = {};
var scene;



//makes a POST request to the given route with the optionally given $_data
//returns a Promise
async function post(route, $_data=undefined){ 
  try{
    return await new Promise((resolve, reject)=>{ //async functions return a promise, so we first await the xhttp response and then resolve either the response, or in case of a catch resolve an "errorview"
      xhttp = new XMLHttpRequest();
      xhttp.open("POST", route, true);
      xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      xhttp.onload = () => {
        resolve(xhttp.response);
      };
      xhttp.onerror = (err)=>{
        console.log(`Error in views.js, async function post, line ${24/*LL*/}!`);
        console.log('The xhttp request resulted in an error');
        console.log('error: ', err);
        resolve(JSON.stringify({view:'errorView', msg:'An error occured.<br>Maybe your internet connection is unstable.'}));
      };
      xhttp.timeout = 30000; // Set timeout to 30 seconds 
      xhttp.ontimeout = ()=>{
        console.log(`Error in globals.js, async function post, line ${31/*LL*/}!`);
        console.log('The xhttp request timed out');
        resolve(JSON.stringify({view:'errorView', msg:'The server timed out.'}));
      };
      xhttp.send($_data);
    });
  }
  catch(err){ // in case an error was thrown, we return an error-view
    console.log(`Error in views.js, async function post, line ${39/*LL*/}!`);
    console.log('The following error was thrown: ', err);
    resolve(JSON.stringify({view:'errorView', msg:'An error occured.'}));
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


function DateToString(date){
  let time = '';
  let dummy;
  time += date.getFullYear();
  time +='/';
  dummy = date.getMonth() + 1;
  time += dummy>9?dummy:('0'+dummy);
  time +='/';
  dummy = date.getDate();
  time += dummy>9?dummy:('0'+dummy);
  time +=' ';
  dummy = date.getHours();
  time += dummy>9?dummy:('0'+dummy);
  time +=':';
  dummy = date.getMinutes();
  time += dummy>9?dummy:('0'+dummy);
  time +=':';
  dummy = date.getSeconds();
  time += dummy>9?dummy:('0'+dummy);
  time +=':';
  dummy = date.getMilliseconds();
  time += dummy>99?dummy:(dummy>9?('0'+dummy):('00'+dummy));
  return time;
}


