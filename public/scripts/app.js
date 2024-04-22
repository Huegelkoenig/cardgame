function gameLoop(){
  cardgameCanvas.clear();
  for(z=0; z<scene.layers.length; ++z){
    scene.layers[z].forEach(element => {
      element.o.draw(cardgameCanvas.ctx, element.target);
    });
  }
  requestAnimationFrame(gameLoop);
}