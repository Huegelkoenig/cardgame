//const misc = require('../misc/misc.js')

const dbScripts = require("../db-scripts/db-scripts");

function initGame(socket){
  const listOfFilesToLoad = {images: [{size: 113, name: 'clubs'               }, //array of graphics and sounds + user-dependant graphics and sounds //TODO: insert real values                                      
                                      {size: 114, name: 'diamonds'            },                                      
                                      {size: 110, name: 'hearts'              },                                  
                                      {size: 111, name: 'spades'              },
                                      {size:  18, name: 'menu_background'     },
                                      {size:   8, name: 'frame_black'         },
                                      {size:   8, name: 'frame_blue'          },
                                      {size:   8, name: 'frame_orange'        },
                                      {size:   8, name: 'frame_red'           },
                                      {size:   55, name: 'loadingbar'         },
                                      {size:   48, name: 'loadingbar_grey'    },
                                      {size: 100, name: '1'                   }, //DELETE: large files just for testing
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
                                      {size: 100, name: 'a (12)'              },
                                      {size:  22, name: 'aatolex'             }                                     
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