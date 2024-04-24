let lastTime = 0;
function gameLoop(timeStamp){
  let deltaTime = timeStamp-lastTime;
  lastTime=timeStamp;

  cardgameCanvas.clear();
  for(z=0; z<scene.layers.length; ++z){
    for (const item of Object.values(scene.layers[z])){
      item.asset.draw(cardgameCanvas.ctx, item.target);
    };
  }
  requestAnimationFrame(gameLoop);
}