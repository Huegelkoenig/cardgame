//const misc = require('../misc/misc.js')

const dbScripts = require("../db-scripts/db-scripts");

function initGame(socket){
  const listOfFilesToLoad = {images: [{size:  99, name: 'hearts'              }, //array of graphics and sounds + user-dependant graphics and sounds //TODO: insert real values                                      
                                      {size: 116, name: 'hearts_highlighted'  },
                                      {size: 100, name: 'spades'              },                                      
                                      {size: 116, name: 'spades_highlighted'  },
                                      {size: 102, name: 'clubs'               },
                                      {size: 119, name: 'clubs_highlighted'   },                                      
                                      {size: 101, name: 'diamonds'            },
                                      {size: 118, name: 'diamonds_highlighted'},
                                  /*  {size: 100, name: '1'                   }, //DELETE: large files just for testing
                                      {size: 100, name: '2'                   },
                                      {size: 100, name: '3'                   },
                                      {size: 100, name: 'a (1)'               },
                                      {size: 100, name: 'a (2)'               },
                                      {size: 100, name: 'a (3)'               },
                                      {size: 100, name: 'a (4)'               },
                                      {size: 100, name: 'a (5)'               },
                                      {size: 100, name: 'a (6)'               },
                                      {size: 100, name: 'a (7)'               },
                                      {size: 100, name: 'a (8)'               },
                                      {size: 100, name: 'a (9)'               },
                                      {size: 100, name: 'a (10)'              },
                                      {size: 100, name: 'a (11)'              },
                                      {size: 100, name: 'a (12)'              },*/
                                      {size:  22, name: 'aatolex'             },
                                      {size:  18, name: 'menu_background'     }
                                     ],
                             sounds: []}; //TODO: also append sounds and maybe user specific images or sounds
  let totalSize = 0;
  Object.values(listOfFilesToLoad).forEach((list)=>{list.forEach((el)=>{totalSize+=el.size})});
  listOfFilesToLoad.totalSize = totalSize;
  socket.emit('connectionValidated', listOfFilesToLoad);


  socket.on('getPlayerState', async ()=>{
    let playerState;
    try{
      playerState = await dbScripts.getPlayerState(socket.username);
    }
    catch (status){
      status.log();
      return;
    }
    socket.emit('setPlayerState', playerState);
  });

  socket.on('getGameState', ()=>{
    //TODO:
    socket.emit('setGameState', {}); 
  })

  //DELETE:
  socket.on('test', ()=>{
    socket.emit('teest');
  });


  //DELETE:  just for testing
  socket.on('press',(x,y)=>{console.log(`${socket.username} pressed at x: ` + x + '   y: '+ y)});
  socket.on('release',(x,y)=>{console.log(`${socket.username} released at x: ` + x + '   y: '+ y)});
}

module.exports = {initGame};