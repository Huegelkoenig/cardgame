var cardgameCanvas;
var ctx;
var fullscreenCanvas;
var fullscreenctx;
var rect;
var scale;

function initCanvas(response){
  document.getElementById('canvasMsg').hidden = true;
  fullscreenCanvas = document.getElementById('fullscreenCanvas');
  /** @type {CanvasRenderingContext2D} **/
  fullscreenctx = fullscreenCanvas.getContext('2d');  
  cardgameCanvas = document.getElementById('cardgameCanvas');
  /** @type {CanvasRenderingContext2D} **/
  ctx = cardgameCanvas.getContext('2d');
  window.addEventListener('resize',()=>{setTimeout(()=>{resize(response)},500)});
  setTimeout(()=>{resize(response)},500);
  inputs = new Inputs();
}

function resize(response){
  fullscreenCanvas.width = window.innerWidth;
  fullscreenCanvas.height = window.innerHeight;
  if (fullscreenCanvas.width/fullscreenCanvas.height < cardgameCanvas.width/cardgameCanvas.height){
    //i.e. fullscreen > canvas.style.height
    scale = fullscreenCanvas.width/cardgameCanvas.width;
    cardgameCanvas.style.width = fullscreenCanvas.width+'px';
    cardgameCanvas.style.height = Math.floor(scale*cardgameCanvas.height)+'px';
    cardgameCanvas.style.setProperty('top', `calc( ( ${fullscreenCanvas.height}px - ${cardgameCanvas.style.height} ) / 2`);
    cardgameCanvas.style.left = 0;
    
  }
  else{
    //i.e. fullscreen > canvas.style.width
    scale = fullscreenCanvas.height/cardgameCanvas.height;
    cardgameCanvas.style.width = Math.floor(scale*cardgameCanvas.width)+'px';
    cardgameCanvas.style.height = fullscreenCanvas.height+'px';
    cardgameCanvas.style.top = 0;
    cardgameCanvas.style.setProperty('left', `calc( ( ${fullscreenCanvas.width}px - ${cardgameCanvas.style.width} ) / 2`);
    
  } 
  rect = cardgameCanvas.getBoundingClientRect();
  console.log(rect);
  fillit(response); //TODO: löschen, wenn drawing-loop aktiv ist
} 



function fillit(response){
  fullscreenctx.fillStyle = 'lightblue';
  fullscreenctx.fillRect(0,0,fullscreenCanvas.width, fullscreenCanvas.height);
  ctx.fillStyle = '#AAAAAA';
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 1;
  ctx.fillRect(0,0,cardgameCanvas.width,cardgameCanvas.height);
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(21, 21, 20, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cardgameCanvas.width-21, 21, 20, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(21, cardgameCanvas.height-21, 20, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cardgameCanvas.width-21, cardgameCanvas.height-21, 20, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
  ctx.font = "30px Arial";
  ctx.fillText(`hi ${response.username} ${fullscreenCanvas.width} ${fullscreenCanvas.height} ${screen.width} ${screen.height} ${window.devicePixelRatio} ${window.visualViewport.scale}`,250,225);
  

  //lade grafiken etc
  //starte drawing loop
}