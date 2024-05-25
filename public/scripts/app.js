let lastTime = 0;
function gameLoop(timeStamp){
  let deltaTime = timeStamp-lastTime;
  lastTime=timeStamp;
  cardgameCanvas.clear();
  for(z=0; z<scene.layers.length; ++z){
    scene.layers[z].forEach((name) => {scene.items[name].update();
                                       scene.items[name].draw(cardgameCanvas.ctx)});
  }
  requestAnimationFrame(gameLoop);
}