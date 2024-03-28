//WARNING: DON'T ADD THIS FILE TO app.html <script src=...>
window.onload = ()=>{
  let response = {view: 'resetView',
                  msg : ''};
  showView(response);
}

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
        console.log(`Error in resetpassword.js, async function post, line ${20/*LL*/}!`);
        console.log('The xhttp request resulted in an error');
        console.log('error: ', err);
        resolve(JSON.stringify({view:'errorView', msg:'An error occured.<br>Maybe your internet connection is unstable.'}));
      };
      xhttp.timeout = 5000; // Set timeout to 5 seconds //TODO: 30s(?)
      xhttp.ontimeout = ()=>{
        console.log(`Error in resetpassword.js, async function post, line ${27/*LL*/}!`);
        console.log('The xhttp request timed out');
        resolve(JSON.stringify({view:'errorView', msg:'The server timed out.'}));
      };
      xhttp.send($_data);
    });
  }
  catch(err){ // in case an error was thrown, we return an error-view
    console.log(`Error in resetpassword.js, async function post, line ${35/*LL*/}!`);
    console.log('The following error was thrown: ', err);
    return JSON.stringify({view:'errorView', msg:'An error occured.'});
  }
}

function showView(response) {
  document.querySelectorAll(`.views`).forEach( (el)=>{el.hidden = true;} );
  //disable previous EventListeners
  document.querySelectorAll('.views:not(.canvasView)').forEach((view)=>{
    document.getElementById(view.id).outerHTML = document.getElementById(view.id).outerHTML;
  });
  //setup new EventListeners and show additional messages
  switch(response.view){
    case 'resetView':
      document.getElementById('resetForm').addEventListener('submit', submitForm);
      document.getElementById('resetMsg').innerHTML = response.msg;
    break;
    case 'errorView':
      document.getElementById('errorMsg').innerHTML = response.msg;
    break;
    default:
      alert(`error in switch statement, resetpassword.js, line ${57/*LL*/}`);
      console.log(`error in switch statement, line ${58/*LL*/}`);
      console.log('response.view in switch statement is:', response.view);
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
  let urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');
  let resetID = window.location.pathname.split('/');
  let response = JSON.parse(await post(this.attributes.action.nodeValue + '/' + resetID[resetID.length-1], urlEncodedData));
  this.submit.disabled = false;
  showView(response);
}