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
      Scene.switchTo('intro');
      gameLoop();
      setTimeout(()=>{socket.emit('getPlayerState')}, 1000);  //TODO: Zeit anpassen in der das Intro gezeigt wird
    });
  });
}


function defineElements(){
  elements['clubs'] = new Sprite(graphics['clubs']);
  elements['spades'] = new Sprite(graphics['spades']);
  elements['hearts'] = new Sprite(graphics['hearts']);
  //TODO:  maybe: class Element(){...}
}

function defineScenes(){  //TODO: o: object(ELEMENT!!!)  each object(ELEMENT) has its own draw method. See class_sprite.js : a whole image as sprite
  scenes['intro'] = new Scene();
  scenes['intro'].setBackground(graphics['aatolex']);

  scenes['mainMenu'] = new Scene();
  scenes['mainMenu'].setBackground(graphics['menu_background']);
  scenes['mainMenu'].layers = [[{name: 'clubs', o: elements['clubs'], target: {x:50, y:50}}, {name: 'spades', o: elements['spades'], target: {x:300, y:450, width: 1600, height: 100}}, {name:'hearts', o: elements['hearts'], target: {x:300, y:600, scale: 0.4}}]];
}
