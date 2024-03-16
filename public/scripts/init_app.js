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
  
  let clgresp = await connectToSocketIO(response);
  console.log(clgresp);
   //TODO: 
  //lade grafiken etc
  //loadingscreen
  
  //starte drawing loop  
  
  
}




function loadFiles(listOfFilesToLoad){
  let filesStillLoading = 0;
  function loadingLoop(){   //TODO: rethink this part - maybe create promises resolve them .onload(...)
    if (filesStillLoading>0){
      requestAnimationFrame(loadingLoop);
    }
    else{
      alert('get Player state');
    }
  }
  //TODO: loading both loadingbars first is pretty ugly
  let gesamt = listOfFilesToLoad.imagesize;
  graphics.loadingbar = new Image();
  graphics.loadingbar.src = '/image/loadingbar';
  graphics.loadingbar.onload =()=>{
    cardgameCanvas.drawImage(graphics.loadingbar, new Point2D(100,300), 1);
    graphics.loadingbar2 = new Image();
    graphics.loadingbar2.src = '/image/loadingbar2';
    graphics.loadingbar2.onload =()=>{
      let loadingstatus = 0;//since loadingbar and loadingbar2 have been loaded already   //TODO:: it really feels like pretty bad code
      listOfFilesToLoad.list.forEach( (file) => {filesStillLoading++;
                                                if (file.type == 'image'){  //TODO: switch!?
                                                   graphics[file.name] = new Image();
                                                   graphics[file.name].src = '/image/'+file.name;  //sends GET request
                                                   graphics[file.name].onload = ()=>{filesStillLoading--;
                                                                                    loadingstatus += file.size;
                                                                                    console.log(loadingstatus);
                                                                                    cardgameCanvas.ctx.drawImage(graphics.loadingbar2, 0, 0, graphics.loadingbar.width*loadingstatus/gesamt, graphics.loadingbar.height, 100, 300, graphics.loadingbar.width*loadingstatus/gesamt, graphics.loadingbar.height);                                                                               
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
