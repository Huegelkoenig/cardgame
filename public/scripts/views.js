function showView(response) {
  document.querySelectorAll(`.views`).forEach( (el)=>{el.hidden = true;} );
  //disables all previous EventListeners
  document.querySelectorAll('.views:not(.canvasView)').forEach((view)=>{
    document.getElementById(view.id).outerHTML = document.getElementById(view.id).outerHTML;
  });
  document.getElementById(response.view).hidden = false;  //must be called here, or *.disabled  doesn't work
  //setup new EventListeners and show additional messages
  switch(response.view){
    case 'loginView':
      document.getElementById('loginForm').addEventListener('submit', submitForm);
      document.getElementById('loginMsg').innerHTML = response.msg;
      document.getElementById('login_register').addEventListener('click', (evt)=>{evt.preventDefault(); response = {view: 'registerView', msg : ''}; showView(response);});
      document.getElementById('login_recover').addEventListener('click', (evt)=>{evt.preventDefault(); response = {view: 'recoverView', msg : ''}; showView(response);});
    break;
    case 'registerView':
      document.getElementById('registerForm').addEventListener('submit', submitForm);
      document.getElementById('register_login').addEventListener('click', (evt)=>{evt.preventDefault(); response = {view: 'loginView', msg : ''}; showView(response);});
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
      document.getElementById('recover_login').addEventListener('click', (evt)=>{evt.preventDefault(); response = {view: 'loginView', msg : ''}; showView(response);});
    break;
    case 'resetView':
      document.getElementById('resetForm').addEventListener('submit', submitForm);
      document.getElementById('resetMsg').innerHTML = response.msg;
      document.getElementById('reset_login').addEventListener('click', (evt)=>{evt.preventDefault(); response = {view: 'loginView', msg : ''}; showView(response);});
    break;
    case 'canvasView':
      initialize(response);
    break;
    case 'errorView':
      document.getElementById('errorMsg').innerHTML = response.msg;
      document.getElementById('error_login').addEventListener('click', (evt)=>{evt.preventDefault(); response = {view: 'loginView', msg : ''}; showView(response);});
    default:
      alert(`error in switch statement, views.js, line ${55/*LL*/}`);
      console.log(`error in switch statement, line ${56/*LL*/}`);
      console.log('viewID in switch statement is:', viewID);
    break;
  }
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
  console.log(this.attributes.action.nodeValue + ' has type ' + typeof(this.attributes.action.nodeValue));
  let response = JSON.parse(await post(this.attributes.action.nodeValue, urlEncodedData));
  this.submit.disabled = false;
  showView(response);
}