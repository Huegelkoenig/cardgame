var canvas;
var bound;
var ctx;
function initCanvas(){
  canvas = document.getElementById('CardgameCanvas');
  bound = canvas.getBoundingClientRect();
  resize();
  /** @type {CanvasRenderingContext2D} **/
  ctx = canvas.getContext('2d');
  ctx.fillStyle = '#AAAAAA';
  ctx.strokeStyle = '#000000';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = '#000000';
  ctx.fillRect(0,0,10,10);
  ctx.fillRect(790,0,10,10);
  ctx.fillRect(0,440,10,10);
  ctx.fillRect(790,440,10,10);
  ctx.font = "30px Arial";
  ctx.fillText('hi, loaded in '+ loadTime + 'ms',400,225);
}

function resize(){
  canvas.style.width = window.innerWidth+'px';
  canvas.style.height = window.innerHeight+'px';
  rect = canvas.getBoundingClientRect();
}
window.addEventListener('resize', resize);