function gameLoop(){
  cardgameCanvas.clear();
  for(z=0; z<scene.layers.length; ++z){
    scene.layers[z].forEach(obj => {
      //console.log(obj);
      obj.o.draw(cardgameCanvas.ctx, obj.target);
    });
  }
  requestAnimationFrame(gameLoop);
}