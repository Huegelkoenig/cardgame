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
  let PositionOfLoadingbar = new Point2D(450, 300);
  scenes.loading.addToLayer(0, 'loadingmessage', new Item(new TextElement('loading graphics'),  //scenes.loading gets defined in client_IO.js
                                                          {x:400, y:200}));
  Promise.all(loadAssets(graphics, 'img', [{name: 'loadingbar'}, {name: 'loadingbar_grey'}]))
  .then(()=>{
    let loadingstatus = 0;
    scenes.loading.addToLayer(0, 'loadingbar_grey', new Item(new Sprite(graphics['loadingbar_grey']),
                                                        {x: PositionOfLoadingbar.x, y: PositionOfLoadingbar.y}));
    scenes.loading.addToLayer(1, 'loadingbar',new Item(new Sprite(graphics['loadingbar'], {x:0, y:0, width:0, height: graphics.loadingbar.height}),
                                                        {x: PositionOfLoadingbar.x, y: PositionOfLoadingbar.y, width: graphics.loadingbar.width*loadingstatus/listOfFilesToLoad.totalSize, height: graphics.loadingbar.height}));
    function adjustLoadingBar(loadedSize){
      loadingstatus += loadedSize;
      scenes.loading.layers[1].loadingbar.asset.origin = {x:0, y:0, width:graphics.loadingbar.width*loadingstatus/listOfFilesToLoad.totalSize, height:graphics.loadingbar.height}; //layers[1] is hardcoded here
      scenes.loading.layers[1].loadingbar.target = {x: PositionOfLoadingbar.x, y: PositionOfLoadingbar.y, width:graphics.loadingbar.width*loadingstatus/listOfFilesToLoad.totalSize, height:graphics.loadingbar.height};
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
  /* //for testing
  scenes.mainMenu.addToLayer(2, 'clubs',  new Item(new Sprite(graphics.clubs),
                                                   {x:50, y:50},
                                                   ['clickable'],
                                                   ()=>{console.log('clubs wurden gedrückt')}
                                                  ));
  scenes.mainMenu.addToLayer(0, 'spades', new Item(new Sprite(graphics.spades),
                                                   {x:300, y:500, width: 1600, height: 50}
                                                  ));
  scenes.mainMenu.addToLayer(1, 'hearts', new Item(new Sprite(graphics.hearts),
                                                   {x:300, y:600, scale: 0.4},
                                                   ['dragable'],
                                                   ()=>{},
                                                   ()=>{scene.items.hearts.offset.assign(0,0)} // item 'hearts' is send back to its original position 
                                                  ));
  scenes.mainMenu.addToLayer(0, 'someText', new Item(new TextElement('blaBlubb 09', {font: "100px Helvetica", fillStyle: 'black'}),
                                                     {x:300, y:800}
                                                    ));
  */
 scenes.mainMenu.addToLayer(0, 'squircle1', new Item(new Squircle([{roundX:20, roundY:70, scale:1, color:'rgba(0,0,255,0.3)'},
                                                                   {roundX:0, roundY:0, scale:0.89, color:'rgba(245,155,66,0.3)'},
                                                                   {roundX:100, roundY:100, scale:0.86, color:'rgba(255,255,255,0.3)'},
                                                                   {roundX:80, roundY:30, scale:0.68, color:'darkgreen'}],
                                                                   'hi',
                                                                   {font: '36px Comic Sans MS',
                                                                    fillStyle: 'white'}
                                                                  ),
                                                     {x:1000, y:400, width: 300, height: 200},
                                                     ['dragable'],
                                                     ()=>{},
                                                     ()=>{scene.items.squircle1.target = new Point2D(scene.items.squircle1.target.x + scene.items.squircle1.target.offset.x, //item 'squircle1' gets new position (including clickbox)
                                                                                                     scene.items.squircle1.target.y + scene.items.squircle1.target.offset.y);
                                                          scene.items.squircle1.target.offset.assign(0,0);
                                                     }));
}
