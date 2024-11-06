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
  scenes.loading.addItem('loadingmessage', new Item(new TextElement('loading graphics'),  //scenes.loading gets defined in client_IO.js
                                                          {layer: 0, x:400, y:200}));
  Promise.all(loadAssets(graphics, 'img', [{name: 'loadingbar'}, {name: 'loadingbar_grey'}]))
  .then(()=>{
    let loadingstatus = 0;
    scenes.loading.addItem('loadingbar_grey', new Item(new Sprite(graphics['loadingbar_grey']),
                                                        {layer: 0, x: PositionOfLoadingbar.x, y: PositionOfLoadingbar.y}));
    scenes.loading.addItem('loadingbar',new Item(new Sprite(graphics['loadingbar'], {x:0, y:0, width:0, height: graphics.loadingbar.height}),
                                                        {layer: 1, x: PositionOfLoadingbar.x, y: PositionOfLoadingbar.y, width: graphics.loadingbar.width*loadingstatus/listOfFilesToLoad.totalSize, height: graphics.loadingbar.height}));
    function adjustLoadingBar(loadedSize){
      loadingstatus += loadedSize;
      scenes.loading.items.loadingbar.asset.origin = {x:0, y:0, width:graphics.loadingbar.width*loadingstatus/listOfFilesToLoad.totalSize, height:graphics.loadingbar.height};
      scenes.loading.items.loadingbar.target = {x: PositionOfLoadingbar.x, y: PositionOfLoadingbar.y, width:graphics.loadingbar.width*loadingstatus/listOfFilesToLoad.totalSize, height:graphics.loadingbar.height};
    }
    Promise.all([...loadAssets(graphics, 'img', listOfFilesToLoad.images, adjustLoadingBar), ...loadAssets(sounds, 'audio', listOfFilesToLoad.sounds, adjustLoadingBar)])
      .then(()=>{ //everythin is loaded
        defineScenes();
        Scene.switchTo('intro');
        window.addEventListener("mousedown", (evt)=>{inputs.mouseDownHandler(evt)});
        window.addEventListener("mousemove", (evt)=>{inputs.mouseMoveHandler(evt)});
        window.addEventListener("mouseup",   (evt)=>{inputs.mouseUpHandler(evt)});
        window.addEventListener("touchstart",(evt)=>{inputs.touchStartHandler(evt)});
        window.addEventListener("touchmove", (evt)=>{inputs.touchMoveHandler(evt)});
        window.addEventListener("touchend",  (evt)=>{inputs.touchEndHandler(evt)});
        window.addEventListener("touchcancel", (evt)=>{inputs.touchCancelHandler(evt)});
        setTimeout(()=>{socket.emit('getPlayerState')}, 1000);  //TODO: Zeit anpassen in der das Intro gezeigt wird
      });
  });
}



function defineScenes(){  //TODO: each class for assets has its own .draw method  (like in class_textElement.js or class_sprite.js)
  //------vvv intro vvv----------------------------------------------------------------------
  scenes['intro'] = new Scene();
  scenes.intro.setBackground(graphics['aatolex']);  //has exactly 2000x900pixels
  //-----^^^ intro ^^^-----------------------------------------------------------------------

  //-----vvv testScene vvv-------------------------------------------------------------------
  scenes['testScene'] = new Scene();
  scenes.testScene.setBackground(graphics['test_background']);
  /* //for testing
  scenes.testScene.addToLayer('clubs',  new Item(new Sprite(graphics.clubs),
                                                   {layer: 2, x:50, y:50},
                                                   ['clickable'],
                                                   ()=>{console.log('clubs wurden gedrückt')}
                                                  ));
  scenes.testScene.addToLayer('spades', new Item(new Sprite(graphics.spades),
                                                   {layer: 0, x:300, y:500, width: 1600, height: 50}
                                                  ));
  scenes.testScene.addToLayer('hearts', new Item(new Sprite(graphics.hearts),
                                                   {layer: 1, x:300, y:600, scale: 0.4},
                                                   ['dragable'],
                                                   ()=>{},
                                                   ()=>{scene.items.hearts.offset.assign(0,0)} // item 'hearts' is send back to its original position 
                                                  ));
  scenes.testScene.addToLayer('someText', new Item(new TextElement('blaBlubb 09', {font: "100px Helvetica", fillStyle: 'black'}),
                                                     {layer: 0, x:300, y:800}
                                                    ));
  */
  scenes.testScene.addItem('squircle1', new Item(new Squircle([{roundX:20, roundY:70, scale:1, color:'rgba(0,0,255,0.3)'},
                                                                   {roundX:0, roundY:0, scale:0.89, color:'rgba(245,155,66,0.3)'},
                                                                   {roundX:100, roundY:100, scale:0.86, color:'rgba(255,255,255,0.3)'},
                                                                   {roundX:80, roundY:30, scale:0.68, color:'darkgreen'}],
                                                                   'hi',
                                                                   {font: '36px Comic Sans MS',
                                                                    fillStyle: 'white'}
                                                                  ),
                                                     {layer: 0, x:1000, y:400, width: 300, height: 200},
                                                     ['dragable'],
                                                     {dragStart: ()=>{scene.pushToTop('squircle1');
                                                                      scene.items.squircle1.asset.text = 'X';},
                                                      onDrag: ()=>{scene.items.squircle1.asset.text += 'X'},
                                                      dragEnd: ()=>{scene.changeLayer('squircle1', 0);
                                                                    scene.items.squircle1.asset.text = 'not anymore';
                                                                    scene.items.squircle1.target = new Point2D(scene.items.squircle1.target.x + scene.items.squircle1.target.offset.x, //item 'squircle1' gets new position (including clickbox)
                                                                                                               scene.items.squircle1.target.y + scene.items.squircle1.target.offset.y);
                                                                    scene.items.squircle1.target.offset.assign(0,0);}}
                                                      ));
  scenes.testScene.addItem('squircle2', new Item(new Squircle([{roundX:20, roundY:70, scale:1, color:'rgba(0,0,255,0.3)'},
                                                                   {roundX:0, roundY:0, scale:0.89, color:'rgba(245,155,66,0.3)'},
                                                                   {roundX:100, roundY:100, scale:0.86, color:'rgba(255,255,255,0.3)'},
                                                                   {roundX:80, roundY:30, scale:0.68, color:'darkgreen'}],
                                                                   'hi 2',
                                                                   {font: '36px Comic Sans MS',
                                                                    fillStyle: 'white'}
                                                                  ),
                                                     {layer: 0, x:500, y:200, width: 300, height: 200},
                                                     ['dragable'],
                                                     {hover: ()=>{if (!inputs.dragAlreadyStarted){scene.items.squircle2.asset.text = 'hovered';}},
                                                      unhover: ()=>{scene.items.squircle2.asset.text = 'unhovered'},
                                                      dragStart: ()=>{scene.pushToTop('squircle2')},
                                                      dragEnd: ()=>{scene.changeLayer('squircle2', 0);
                                                                    scene.items.squircle2.offset.assign(0,0);
                                                                   }
                                                     }
                              ));    
  scenes.testScene.addItem('animation', new Item(new Animation(graphics.hearts, 2000, new Coords(0,0,graphics.hearts.width/10,graphics.hearts.height), new Coords(graphics.hearts.width/10,0,0,0), [0,2,4,6,8]),
                                                {layer:1, x:200, y:600, width: 200, height: 300},
                                                ['dragable', 'clickable'],
                                                {onClick: ()=>{scene.items.animation.asset.trigger()},
                                                 dragStart: ()=>{scene.pushToTop('animation')},
                                                 dragEnd: ()=>{scene.changeLayer('animation', 0);
                                                               scene.items.animation.target = new Point2D(scene.items.animation.target.x + scene.items.animation.target.offset.x, //item 'animation' gets new position (including clickbox)
                                                                                                          scene.items.animation.target.y + scene.items.animation.target.offset.y);
                                                               scene.items.animation.target.offset.assign(0,0);
                                                              }
                                                }
                                              ));
  //-----^^^ testScene ^^^-------------------------------------------------------------------

  //-----vvv mainMenu vvv--------------------------------------------------------------------
  scenes['mainMenu'] = new Scene();
  scenes.mainMenu.setBackground(graphics['mainMenu_background']);

  scenes.mainMenu.addItem('button_quickstart', new Item(new Squircle([{roundX:20, roundY:70, scale:1, color:'rgba(0,0,255,0.3)'},
                                                                   {roundX:0, roundY:0, scale:0.89, color:'rgba(245,155,66,0.3)'},
                                                                   {roundX:100, roundY:100, scale:0.86, color:'rgba(255,255,255,0.3)'},
                                                                   {roundX:80, roundY:30, scale:0.68, color:'rgba(0,100,0,1)'}],
                                                                   'Quickstart',
                                                                   {font: '32px Comic Sans MS',
                                                                    fillStyle: 'white'}
                                                                  ),
                                                     {layer: 0, x:850, y:100, width: 300, height: 200},
                                                     ['clickable'],
                                                     {hover: ()=>{scene.items.button_quickstart.asset.layers[0].color = 'rgba(0,0,255,0.7)';
                                                                  scene.items.button_quickstart.asset.layers[1].color = 'rgba(245,155,66,0.7)';
                                                                  scene.items.button_quickstart.asset.layers[2].color = 'rgba(255,255,255,0.7)'},
                                                      unhover: ()=>{scene.items.button_quickstart.asset.layers[0].color = 'rgba(0,0,255,0.3)';
                                                                    scene.items.button_quickstart.asset.layers[1].color = 'rgba(245,155,66,0.3)';
                                                                    scene.items.button_quickstart.asset.layers[2].color = 'rgba(255,255,255,0.3)'},
                                                      onClick: ()=>{scene.items.button_quickstart.actions.unhover();
                                                                    Scene.switchTo('quickstart');}
                                                     }
                                                      ));

  scenes.mainMenu.addItem('button_createGame', new Item(new Squircle([{roundX:20, roundY:70, scale:1, color:'rgba(0,0,255,0.3)'},
                                                                   {roundX:0, roundY:0, scale:0.89, color:'rgba(245,155,66,0.3)'},
                                                                   {roundX:100, roundY:100, scale:0.86, color:'rgba(255,255,255,0.3)'},
                                                                   {roundX:80, roundY:30, scale:0.68, color:'rgba(0,100,0,1)'}],
                                                                   'Create Game',
                                                                   {font: '32px Comic Sans MS',
                                                                    fillStyle: 'white'}
                                                                  ),
                                                     {layer: 0, x:850, y:350, width: 300, height: 200},
                                                     ['clickable'],
                                                     {hover: ()=>{scene.items.button_createGame.asset.layers[0].color = 'rgba(0,0,255,0.7)';
                                                                  scene.items.button_createGame.asset.layers[1].color = 'rgba(245,155,66,0.7)';
                                                                  scene.items.button_createGame.asset.layers[2].color = 'rgba(255,255,255,0.7)'},
                                                      unhover: ()=>{scene.items.button_createGame.asset.layers[0].color = 'rgba(0,0,255,0.3)';
                                                                    scene.items.button_createGame.asset.layers[1].color = 'rgba(245,155,66,0.3)';
                                                                    scene.items.button_createGame.asset.layers[2].color = 'rgba(255,255,255,0.3)'},
                                                      onClick: ()=>{scene.items.button_createGame.actions.unhover();
                                                                    Scene.switchTo('createGame');}
                                                     }
                                                      ));
  scenes.mainMenu.addItem('button_joinGame', new Item(new Squircle([{roundX:20, roundY:70, scale:1, color:'rgba(0,0,255,0.3)'},
                                                                   {roundX:0, roundY:0, scale:0.89, color:'rgba(245,155,66,0.3)'},
                                                                   {roundX:100, roundY:100, scale:0.86, color:'rgba(255,255,255,0.3)'},
                                                                   {roundX:80, roundY:30, scale:0.68, color:'rgba(0,100,0,1)'}],
                                                                   'Join Game',
                                                                   {font: '32px Comic Sans MS',
                                                                    fillStyle: 'white'}
                                                                  ),
                                                     {layer: 0, x:850, y:600, width: 300, height: 200},
                                                     ['clickable'],
                                                     {hover: ()=>{scene.items.button_joinGame.asset.layers[0].color = 'rgba(0,0,255,0.7)';
                                                                  scene.items.button_joinGame.asset.layers[1].color = 'rgba(245,155,66,0.7)';
                                                                  scene.items.button_joinGame.asset.layers[2].color = 'rgba(255,255,255,0.7)'},
                                                      unhover: ()=>{scene.items.button_joinGame.asset.layers[0].color = 'rgba(0,0,255,0.3)';
                                                                    scene.items.button_joinGame.asset.layers[1].color = 'rgba(245,155,66,0.3)';
                                                                    scene.items.button_joinGame.asset.layers[2].color = 'rgba(255,255,255,0.3)'},
                                                      onClick: ()=>{scene.items.button_joinGame.actions.unhover();
                                                                    Scene.switchTo('joinGame');}
                                                     }
                              ));
//-----^^^ mainMenu ^^^--------------------------------------------------------------------


//-----vvv quickstart vvv-------------------------------------------------------------------
scenes['quickstart'] = new Scene();
scenes.quickstart.setBackground(graphics['quickstart_background']);
scenes.quickstart.addItem('quickstart_text', new Item(new TextElement('Waiting for other players',{font: '32px Comic Sans MS',fillStyle: 'black'}),
                                                      {layer: 0, x:500, y:400}
                          ));
scenes.quickstart.addItem('button_back', new Item(new Squircle([{roundX:20, roundY:70, scale:1, color:'rgba(0,0,255,0.3)'},
                                                                {roundX:0, roundY:0, scale:0.89, color:'rgba(245,155,66,0.3)'},
                                                                {roundX:100, roundY:100, scale:0.86, color:'rgba(255,255,255,0.3)'},
                                                                {roundX:80, roundY:30, scale:0.68, color:'rgba(0,100,0,1)'}],
                                                                'Back',
                                                                {font: '32px Comic Sans MS',
                                                                 fillStyle: 'white'}
                                                                ),
                                                  {layer: 0, x:850, y:600, width: 300, height: 200},
                                                  ['clickable'],
                                                  {hover: ()=>{scene.items.button_back.asset.layers[0].color = 'rgba(0,0,255,0.7)';
                                                               scene.items.button_back.asset.layers[1].color = 'rgba(245,155,66,0.7)';
                                                               scene.items.button_back.asset.layers[2].color = 'rgba(255,255,255,0.7)'},
                                                   unhover: ()=>{scene.items.button_back.asset.layers[0].color = 'rgba(0,0,255,0.3)';
                                                                 scene.items.button_back.asset.layers[1].color = 'rgba(245,155,66,0.3)';
                                                                 scene.items.button_back.asset.layers[2].color = 'rgba(255,255,255,0.3)'},
                                                   onClick: ()=>{scene.items.button_back.actions.unhover();
                                                                 Scene.switchTo('mainMenu')}
                                                  }
                          ));
scenes.quickstart.events.start = ()=>{scenes.quickstart.variables.refreshID = setInterval(()=>{scene.items.quickstart_text.asset.text += '.'; if(scene.items.quickstart_text.asset.text.length>28){scene.items.quickstart_text.asset.text = 'Waiting for other players'}},1000)};
scenes.quickstart.events.stop = ()=>{clearInterval(scenes.quickstart.variables.refreshID)};
//-----^^ quickstart ^^^-------------------------------------------------------------------


//-----vvv createGame vvv-------------------------------------------------------------------
scenes['createGame'] = new Scene();
scenes.createGame.setBackground(graphics['createGame_background']);
scenes.createGame.addItem('createGame_text', new Item(new TextElement('create a game',{font: '32px Comic Sans MS',fillStyle: 'black'}),
                                                      {layer: 0, x:500, y:400}
                          ));
scenes.createGame.addItem('button_back', new Item(new Squircle([{roundX:20, roundY:70, scale:1, color:'rgba(0,0,255,0.3)'},
                                                                {roundX:0, roundY:0, scale:0.89, color:'rgba(245,155,66,0.3)'},
                                                                {roundX:100, roundY:100, scale:0.86, color:'rgba(255,255,255,0.3)'},
                                                                {roundX:80, roundY:30, scale:0.68, color:'rgba(0,100,0,1)'}],
                                                                'Back',
                                                                {font: '32px Comic Sans MS',
                                                                 fillStyle: 'white'}
                                                                ),
                                                  {layer: 0, x:850, y:600, width: 300, height: 200},
                                                  ['clickable'],
                                                  {hover: ()=>{scene.items.button_back.asset.layers[0].color = 'rgba(0,0,255,0.7)';
                                                               scene.items.button_back.asset.layers[1].color = 'rgba(245,155,66,0.7)';
                                                               scene.items.button_back.asset.layers[2].color = 'rgba(255,255,255,0.7)'},
                                                   unhover: ()=>{scene.items.button_back.asset.layers[0].color = 'rgba(0,0,255,0.3)';
                                                                 scene.items.button_back.asset.layers[1].color = 'rgba(245,155,66,0.3)';
                                                                 scene.items.button_back.asset.layers[2].color = 'rgba(255,255,255,0.3)'},
                                                   onClick: ()=>{scene.items.button_back.actions.unhover();
                                                                 Scene.switchTo('mainMenu')}
                                                  }
                          ));
//-----^^ createGame ^^^-------------------------------------------------------------------


//-----vvv joinGame vvv-------------------------------------------------------------------
scenes['joinGame'] = new Scene();
scenes.joinGame.setBackground(graphics['joinGame_background']);
scenes.joinGame.addItem('joinGame_text', new Item(new TextElement('join a game',{font: '32px Comic Sans MS',fillStyle: 'black'}),
                                                      {layer: 0, x:500, y:400}
                          ));
scenes.joinGame.addItem('button_back', new Item(new Squircle([{roundX:20, roundY:70, scale:1, color:'rgba(0,0,255,0.3)'},
                                                                {roundX:0, roundY:0, scale:0.89, color:'rgba(245,155,66,0.3)'},
                                                                {roundX:100, roundY:100, scale:0.86, color:'rgba(255,255,255,0.3)'},
                                                                {roundX:80, roundY:30, scale:0.68, color:'rgba(0,100,0,1)'}],
                                                                'Back',
                                                                {font: '32px Comic Sans MS',
                                                                 fillStyle: 'white'}
                                                                ),
                                                  {layer: 0, x:850, y:600, width: 300, height: 200},
                                                  ['clickable'],
                                                  {hover: ()=>{scene.items.button_back.asset.layers[0].color = 'rgba(0,0,255,0.7)';
                                                               scene.items.button_back.asset.layers[1].color = 'rgba(245,155,66,0.7)';
                                                               scene.items.button_back.asset.layers[2].color = 'rgba(255,255,255,0.7)'},
                                                   unhover: ()=>{scene.items.button_back.asset.layers[0].color = 'rgba(0,0,255,0.3)';
                                                                 scene.items.button_back.asset.layers[1].color = 'rgba(245,155,66,0.3)';
                                                                 scene.items.button_back.asset.layers[2].color = 'rgba(255,255,255,0.3)'},
                                                   onClick: ()=>{scene.items.button_back.actions.unhover();
                                                                 Scene.switchTo('mainMenu')}
                                                  }
                          ));
//-----^^^ joinGame ^^^-------------------------------------------------------------------


                                              
}
