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
  scenes.loading.addToLayer(0, 'loadingmessage', new Item(new TextElement('loading graphics'),  //scenes.loading gets defined in client_IO.js
                                                          {x:400, y:200}));
  Promise.all(loadAssets(graphics, 'img', [{name: 'loadingbar'}, {name: 'loadingbar2'}]))
  .then(()=>{
    let loadingstatus = 0;
    scenes.loading.addToLayer(0, 'loadingbar', new Item(new Sprite(graphics['loadingbar']),
                                                        {x:100, y:300}));
    scenes.loading.addToLayer(1, 'loadingbar2',new Item(new Sprite(graphics['loadingbar2'], {x:0, y:0, width:0, height: graphics.loadingbar2.height}),
                                                        {x:100, y:300, width: graphics.loadingbar.width*loadingstatus/listOfFilesToLoad.totalSize, height: graphics.loadingbar.height}));
    function adjustLoadingBar(loadedSize){
      loadingstatus += loadedSize;
      scenes.loading.layers[1].loadingbar2.asset.origin = {x:0, y:0, width:graphics.loadingbar.width*loadingstatus/listOfFilesToLoad.totalSize, height:graphics.loadingbar.height}; //layers[1] is hardcoded here
      scenes.loading.layers[1].loadingbar2.setTarget({x:100, y:300, width:graphics.loadingbar.width*loadingstatus/listOfFilesToLoad.totalSize, height:graphics.loadingbar.height});
    }
    Promise.all([...loadAssets(graphics, 'img', listOfFilesToLoad.images, adjustLoadingBar), ...loadAssets(sounds, 'audio', listOfFilesToLoad.sounds, adjustLoadingBar)])
      .then(()=>{ //everythin is loaded
        defineScenes();
        Scene.switchTo('intro');
        setTimeout(()=>{socket.emit('getPlayerState')}, 1000);  //TODO: Zeit anpassen in der das Intro gezeigt wird
      });
  });
}



function defineScenes(){  //TODO: each class for assets has its own .draw method  (like in class_textElement.js or class_Ssprite.js)
  scenes['intro'] = new Scene();
  scenes.intro.setBackground(graphics['aatolex']);  //has exactly 2000x900pixels

  scenes['mainMenu'] = new Scene();
  scenes.mainMenu.setBackground(graphics['menu_background']);
  scenes.mainMenu.addToLayer(0, 'clubs',  new Item(new Sprite(graphics.clubs),
                                                   {x:50, y:50}));
  scenes.mainMenu.addToLayer(0, 'spades', new Item(new Sprite(graphics.spades),
                                                   {x:300, y:500, width: 1600, height: 50}));
  scenes.mainMenu.addToLayer(1, 'hearts', new Item(new Sprite(graphics.hearts),
                                                   {x:300, y:600, scale: 0.4}));
  scenes.mainMenu.addToLayer(0, 'someText', new Item(new TextElement('blaBlubb 09', {font: "100px Helvetica", fillStyle: 'black'}),
                                                     {x:300, y:800}));
}
