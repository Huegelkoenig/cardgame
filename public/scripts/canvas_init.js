var cardgameCanvas;
var ctx;
var rect;
var ratio;
var fullscreenCanvas;
var fullscreenctx;
function initCanvas(response){
  console.log('init');
  document.getElementById('canvasMsg').hidden = true;
  cardgameCanvas = document.getElementById('cardgameCanvas');
  fullscreenCanvas = document.getElementById('fullscreenCanvas');
  /** @type {CanvasRenderingContext2D} **/
  ctx = cardgameCanvas.getContext('2d');  
  /** @type {CanvasRenderingContext2D} **/
  fullscreenctx = fullscreenCanvas.getContext('2d');  
  window.addEventListener('resize',()=>{resize(response)});  
  resize(response)
}

function resize(response){
  console.log('resize');
  fullscreenCanvas.width = window.innerWidth;
  fullscreenCanvas.height = window.innerHeight;
  if (window.innerWidth/window.innerHeight < cardgameCanvas.width/cardgameCanvas.height){
    //fullscreen > canvas.style.height
    cardgameCanvas.style.width = window.innerWidth+'px';
    cardgameCanvas.style.height = Math.floor(window.innerWidth*cardgameCanvas.height/cardgameCanvas.width)+'px';
    cardgameCanvas.style.setProperty('top', `calc( ( ${window.innerHeight}px - ${cardgameCanvas.style.height} ) / 2`);
    cardgameCanvas.style.left = 0;
    ratio = window.innerWidth/cardgameCanvas.width;
  }
  else{
    //fullscreen > canvas.style.width
    cardgameCanvas.style.width = Math.floor(window.innerHeight*cardgameCanvas.width/cardgameCanvas.height)+'px';
    cardgameCanvas.style.height = window.innerHeight+'px';
    cardgameCanvas.style.top = 0;
    cardgameCanvas.style.setProperty('left', `calc( ( ${window.innerWidth}px - ${cardgameCanvas.style.width} ) / 2`);
    ratio = window.innerHeight/cardgameCanvas.height;
  } 
  rect = cardgameCanvas.getBoundingClientRect();
  console.log(rect);
  fillit(response); //TODO: löschen, wenn drawing-loop aktiv ist
} 



function fillit(response){  
  console.log('fillit');
  fullscreenctx = fullscreenCanvas.getContext('2d');
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
  ctx.fillText('hi ' + response.username + '. ',250,225);  
}