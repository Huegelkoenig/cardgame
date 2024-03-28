function gameLoop(){
  for(z=0; z<scenes[scene].length; ++z){
    scenes[scene][z].forEach(obj => {
      cardgameCanvas.drawImage(obj.o, obj.p, obj.scale);
    });
  }
  requestAnimationFrame(gameLoop);
}