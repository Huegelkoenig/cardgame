window.onload = async ()=>{
  let response = JSON.parse(await post('/auth')); 
  //let response = JSON.parse(await fetch('/',{method : "POST", body:'data=0', headers:{"Content-type": "application/x-www-form-urlencoded"}}));
  showView(response);
}


async function initialize(response){
  fullscreenCanvas = new FullscreenCanvas('fullscreenCanvas');
  cardgameCanvas = new FARCanvas('cardgameCanvas');

  document.getElementById('canvasMsg').hidden = true;    
  fullscreenCanvas.resize();
  fullscreenCanvas.fill('lightblue');
  cardgameCanvas.resize();
  cardgameCanvas.fill();
  inputs = new Inputs();

  window.addEventListener('resize', ()=>{fullscreenCanvas.resize(); fullscreenCanvas.fill('lightblue'); cardgameCanvas.resize();});
  cardgameCanvas.filltext('connecting to socket-IO',{x:50, y:50});
  
  await connectToSocketIO(response);//TODO: just   connectToSocketIO(response);  
}




function loadFiles(listOfFilesToLoad){
  let filesStillLoading = 0;
  function loadingLoop(){   //TODO: rethink this part - maybe create promises resolve them .onload(...)
    if (filesStillLoading>0){
      requestAnimationFrame(loadingLoop);
    }
    else{
      defineScenes();
      scene = 'intro';
      gameLoop();
      setTimeout(()=>{socket.emit('getPlayerState')}, 1000);  //TODO: Zeit anpassen
    }
  }
  //TODO: loading both loadingbars first is pretty ugly
  let total = listOfFilesToLoad.imagesize;
  graphics.loadingbar = new Image();
  graphics.loadingbar.src = '/image/loadingbar';
  graphics.loadingbar.onload =()=>{
    cardgameCanvas.drawImage(graphics.loadingbar, new Point2D(100,300), 1);
    graphics.loadingbar2 = new Image();
    graphics.loadingbar2.src = '/image/loadingbar2';
    graphics.loadingbar2.onload =()=>{
      let loadingstatus = 0;//since loadingbar and loadingbar2 have been loaded already   //TODO:: it gets the job done, but really feels like pretty bad code
      listOfFilesToLoad.list.forEach( (file) => {filesStillLoading++;
                                                if (file.type == 'image'){  //TODO: switch!?
                                                   graphics[file.name] = new Image();
                                                   graphics[file.name].src = '/image/'+file.name;  //sends GET request
                                                   graphics[file.name].onload = ()=>{filesStillLoading--;
                                                                                    loadingstatus += file.size;
                                                                                    cardgameCanvas.ctx.drawImage(graphics.loadingbar2, 0, 0, graphics.loadingbar.width*loadingstatus/total, graphics.loadingbar.height, 100, 300, graphics.loadingbar.width*loadingstatus/total, graphics.loadingbar.height);                                                                               
                                                                                    };
                                                }
                                                else if (file.type =='sound'){
                                                  //TODO:  .oncanplaythrough
                                                }
                                        });
      loadingLoop();
  };
}
}



function defineScenes(){
  scenes['intro'] = [[{o: graphics['aatolex'], p: {x:0, y:0}, clickable: false, dragable: false}]];
  scenes['mainMenu'] = [[{o: graphics['a (1)'], p: {x:50, y:50}}], [{o: graphics['clubs'], p: {x:300, y:300}}, {o: graphics['hearts'], p: {x:300, y:600}, scale: 0.5}]];
}
