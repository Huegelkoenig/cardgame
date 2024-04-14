window.onload = async ()=>{
  let response = JSON.parse(await post('/auth')); 
  //let response = JSON.parse(await fetch('/',{method : "POST", body:'data=0', headers:{"Content-type": "application/x-www-form-urlencoded"}}));
  showView(response);
}


function initialize(response){
  fullscreenCanvas = new FullscreenCanvas('fullscreenCanvas');
  backgroundCanvas = new FARCanvas('backgroundCanvas');
  cardgameCanvas = new FARCanvas('cardgameCanvas');

  document.getElementById('canvasMsg').hidden = true;    
  fullscreenCanvas.resize();
  fullscreenCanvas.fill('lightblue');
  backgroundCanvas.resize();
  backgroundCanvas.fill('pink');
  cardgameCanvas.resize();
  cardgameCanvas.fill();
  inputs = new Inputs();

  window.addEventListener('resize', ()=>{fullscreenCanvas.resize(); fullscreenCanvas.fill('lightblue'); backgroundCanvas.resize(); cardgameCanvas.resize();});
  cardgameCanvas.filltext('connecting to socket-IO',{x:50, y:50});
  
  connectToSocketIO(response); //if connection is established, function loadFiles will be called
}




function loadFiles(listOfFilesToLoad){
  cardgameCanvas.filltext('loading graphics', {x:400, y:200});
  Promise.all(loadAssets(graphics, 'img', [{name: 'loadingbar'}, {name: 'loadingbar2'}]))
  .then(()=>{
    let loadingstatus = 0;
    function drawLoadingBar(loadedSize){
      loadingstatus += loadedSize;
      cardgameCanvas.ctx.drawImage(graphics.loadingbar2, 0, 0, graphics.loadingbar.width*loadingstatus/listOfFilesToLoad.totalSize, graphics.loadingbar.height, 100, 300, graphics.loadingbar.width*loadingstatus/listOfFilesToLoad.totalSize, graphics.loadingbar.height);
    }
    cardgameCanvas.drawImage(graphics.loadingbar, new Point2D(100,300), 1);
   Promise.all([...loadAssets(graphics, 'img', listOfFilesToLoad.images, drawLoadingBar), ...loadAssets(sounds, 'audio', listOfFilesToLoad.sounds, drawLoadingBar)])
    .then(()=>{ //all loaded
      defineElements()
      defineScenes();
      scene = 'intro';
      gameLoop();
      setTimeout(()=>{socket.emit('getPlayerState')}, 1000);  //TODO: Zeit anpassen in der das Intro gezeigt wird
    });
  });
}


function defineElements(){
  //TODO:  maybe: class Element(){...}
}

function defineScenes(){  //TODO: o: object(ELEMENT!!!)  each object(ELEMENT) has its own draw method. See class_sprite.js : a whole image as sprite
  scenes['intro'] = [[{o: graphics['aatolex'], p: {x:0, y:0}, clickable: false, dragable: false, hoverable: false}]];
  scenes['mainMenu'] = [[{o: graphics['a (1)'], p: {x:50, y:50}}], [{o: graphics['clubs'], p: {x:300, y:300}}, {o: graphics['hearts'], p: {x:300, y:600}, scale: 0.5}]];
}
