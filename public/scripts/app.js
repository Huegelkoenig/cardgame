function gameLoop(){
  cardgameCanvas.clear();
  for(z=0; z<scene.layers.length; ++z){
    for (const element of Object.values(scene.layers[z])){
      element.asset.draw(cardgameCanvas.ctx, element.target);
    };
  }
  requestAnimationFrame(gameLoop);
}