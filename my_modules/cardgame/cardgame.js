const misc = require('../misc/misc.js')

function initGame(socket){
  const listOfFilesToLoad = {list: [ {type: 'image',  name: 'hearts',               size:  99}, //array of graphics and sounds + user-dependant graphics and sounds //TODO: insert real values
                             {type: 'image',  name: '1',             size: 100},
                             {type: 'image',  name: 'hearts_highlighted',   size: 116},
                             {type: 'image',  name: 'spades',               size: 100},
                             {type: 'image',  name: '2',             size: 100},
                             {type: 'image',  name: 'spades_highlighted',   size: 116},
                             {type: 'image',  name: 'clubs',                size: 102},
                             {type: 'image',  name: 'clubs_highlighted',    size: 119},
                             {type: 'image',  name: '3',             size: 100},
                             {type: 'image',  name: 'diamonds',             size: 101},
                             {type: 'image',  name: 'a (1)',             size: 100},
                             {type: 'image',  name: 'a (2)',             size: 100},
                             {type: 'image',  name: 'a (3)',             size: 100},
                             {type: 'image',  name: 'a (4)',             size: 100},
                             {type: 'image',  name: 'a (5)',             size: 100},
                             {type: 'image',  name: 'a (6)',             size: 100},
                             {type: 'image',  name: 'a (7)',             size: 100},
                             {type: 'image',  name: 'a (8)',             size: 100},
                             {type: 'image',  name: 'a (9)',             size: 100},
                             {type: 'image',  name: 'a (10)',             size: 100},
                             {type: 'image',  name: 'a (11)',             size: 100},
                             {type: 'image',  name: 'a (12)',             size: 100},
                             {type: 'image',  name: 'diamonds_highlighted', size: 118}]}; //append user specific imags or sounds
  let imagesize = 0;
  listOfFilesToLoad.list.forEach((el)=>{imagesize+=el.size});
  listOfFilesToLoad.imagesize = imagesize;
  socket.emit('connectionValidated', listOfFilesToLoad);


  //for testing
  socket.on('press',(x,y)=>{console.log(`${socket.username} pressed at x: ` + x + '   y: '+ y)});
  socket.on('release',(x,y)=>{console.log(`${socket.username} released at x: ` + x + '   y: '+ y)});
}

module.exports = {initGame};