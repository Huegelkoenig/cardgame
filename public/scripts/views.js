//makes a POST request to the given route with the optionally given $_data
//returns a Promise
async function post(route, $_data=undefined){ 
  //let views = ['loginView', 'registerView', 'recoverView', 'resetView', 'canvas', 'error'];
  try{
    return await new Promise((resolve, reject)=>{ //async functions return a promise, so we first await the xhttp response and then return either the response, or in case of a catchthis as a promise
      xhttp = new XMLHttpRequest();
      xhttp.open("POST", route, true);
      xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      xhttp.onload = () => {
        resolve(xhttp.response);
      };
      xhttp.onerror = (err)=>{
        console.log(`Error in views.js, async function post, line ${28/*LL*/}!`);
        console.log('The xhttp request resulted in an error');
        console.log('error: ', err);
        resolve(JSON.stringify({view:'errorView', msg:'An error occured.<br>Maybe your internet connection is unstable.'}));
      };
      xhttp.timeout = 5000; // Set timeout to 5 seconds //TODO: 30s(?)
      xhttp.ontimeout = ()=>{
        console.log(`Error in views.js, async function post, line ${35/*LL*/}!`);
        console.log('The xhttp request timed out');
        resolve(JSON.stringify({view:'errorView', msg:'The server timed out.'}));
      };
      xhttp.send($_data);
    });
  }
  catch(err){ // in case an error was thrown, we return an error-view
    console.log(`Error in views.js, async function post, line ${43/*LL*/}!`);
    console.log('The following error was thrown: ', err);
    return JSON.stringify({view:'errorView', msg:'An error occured.'});
  }
}

function showView(response) {
  document.querySelectorAll(`.views`).forEach( (el)=>{el.hidden = true;} );
  //disables all previous EventListeners
  document.querySelectorAll('.views:not(.canvasView)').forEach((view)=>{
    document.getElementById(view.id).outerHTML = document.getElementById(view.id).outerHTML;
  });
  //setup new EventListeners and show additional messages
  switch(response.view){
    case 'loginView':
      document.getElementById('loginForm').addEventListener('submit', submitForm);
      document.getElementById('loginMsg').innerHTML = response.msg;
      document.getElementById('login_register').addEventListener('click', (evt)=>{evt.preventDefault();console.log('click login_register'); response = {view: 'registerView', msg : ''};; showView(response);}) //DELETE: console.log
      document.getElementById('login_recover').addEventListener('click', (evt)=>{evt.preventDefault();console.log('click login_recover'); response = {view: 'recoverView', msg : ''};; showView(response);})    //DELETE: console.log
    break;
    case 'registerView':
      document.getElementById('registerForm').addEventListener('submit', submitForm);
      document.getElementById('register_login').addEventListener('click', (evt)=>{evt.preventDefault();console.log('click register_login'); response = {view: 'loginView', msg : ''};; showView(response);})    //DELETE: console.log
      document.getElementById('registerMsg').innerHTML = response.msg;
      let pw = document.getElementById('pw');
      let pwc = document.getElementById('pwc');
      pw.addEventListener('keyup', validatePW);
      pwc.addEventListener('keyup', validatePW);
      function validatePW(){
        if (pw.value === pwc.value){
          document.getElementById('registersubmit').disabled = false;
          pwc.style.backgroundColor = '#FFFFFF';
          document.getElementById('registerMsg').innerHTML = '<br>';
        }
        else{
          document.getElementById('registersubmit').disabled = true;
          pwc.style.backgroundColor = '#e34f52';
          document.getElementById('registerMsg').innerHTML = 'passwords missmatch';
        }
      }
    break;
    case 'recoverView':
      document.getElementById('recoverForm').addEventListener('submit', submitForm);
      document.getElementById('recoverMsg').innerHTML = response.msg;
      document.getElementById('recover_login').addEventListener('click', (evt)=>{evt.preventDefault();console.log('click recover_login'); response = {view: 'loginView', msg : ''};; showView(response);})    //DELETE: console.log
    break;
    case 'resetView':
      document.getElementById('resetForm').addEventListener('submit', submitForm);
      document.getElementById('resetMsg').innerHTML = response.msg;
      document.getElementById('reset_login').addEventListener('click', (evt)=>{evt.preventDefault();console.log('click reset_login'); response = {view: 'loginView', msg : ''};; showView(response);})        //DELETE: console.log
    break;
    case 'canvasView':
      connectToSocketIO(response);
    break;
    case 'errorView':
      document.getElementById('errorMsg').innerHTML = response.msg;
      document.getElementById('error_login').addEventListener('click', (evt)=>{evt.preventDefault();console.log('click error_login'); response = {view: 'loginView', msg : ''};; showView(response);})        //DELETE: console.log
    break;
    default:
      alert(`error in switch statement, views.js, line ${103/*LL*/}`);
      console.log(`error in switch statement, line ${104/*LL*/}`);
      console.log('viewID in switch statement is:', viewID);
    break;
  }
  document.getElementById(response.view).hidden = false;
}

async function submitForm(evt){
  evt.preventDefault();
  this.submit.disabled = true;
  let formData = new FormData(this);
  let urlEncodedDataPairs = [];
  for (let nameValue of formData.entries()){
    urlEncodedDataPairs.push(encodeURIComponent(nameValue[0]) + '=' + encodeURIComponent(nameValue[1]));
  }
  //urlEncodedDataPairs.push(encodeURIComponent('recoverID') + '=' + encodeURIComponent(response.recoverID));
  let urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');
  let response = JSON.parse(await post(this.attributes.action.nodeValue, urlEncodedData));
  this.submit.disabled = false;
  showView(response);
}