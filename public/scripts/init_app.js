var fullscreenCanvas;
var cardgameCanvas;
var scale;

var inputs;

window.onload = async ()=>{
  let response = JSON.parse(await post('/auth')); 
  //let response = JSON.parse(await fetch('/',{method : "POST", body:'data=0', headers:{"Content-type": "application/x-www-form-urlencoded"}}));
  showView(response);
}


function initCanvas(response){
  document.getElementById('canvasMsg').hidden = true;
  fullscreenCanvas = new FullscreenCanvas('fullscreenCanvas');
  cardgameCanvas = new FARCanvas('cardgameCanvas');
  window.addEventListener('resize',()=>{setTimeout(()=>{fullscreenCanvas.resize(); fullscreenCanvas.fill('lightblue'); cardgameCanvas.resize();}, 500)});
  inputs = new Inputs();

    //TODO: 
    setTimeout(()=>{fullscreenCanvas.resize(); fullscreenCanvas.fill('lightblue'); cardgameCanvas.resize(); cardgameCanvas.fill(response);},500);
    //lade grafiken etc
    //starte drawing loop  
}
