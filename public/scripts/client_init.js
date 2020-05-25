var canvas;
var bound;
var ctx;
function initCanvas(){
  canvas = document.getElementById('CardgameCanvas');
  bound = canvas.getBoundingClientRect();
  /** @type {CanvasRenderingContext2D} **/
  ctx = canvas.getContext('2d');
  ctx.fillStyle = '#AAAAAA';
  ctx.strokeStyle = '#000000';
  ctx.fillRect(0,0,canvas.width,canvas.height);
}