
/*
contains:
a method to create specific buttons for the menu, consisting of squircles
*/



function menuButton(name, textOfButton, switchToScene, position){
  return new Item(new Squircle([{roundX:20, roundY:70, scale:1, color:'rgba(0,0,255,0.3)'},
                                                                   {roundX:0, roundY:0, scale:0.89, color:'rgba(245,155,66,0.3)'},
                                                                   {roundX:100, roundY:100, scale:0.86, color:'rgba(255,255,255,0.3)'},
                                                                   {roundX:80, roundY:30, scale:0.68, color:'rgba(0,100,0,1)'}],
                                                                   textOfButton,
                                                                   {font: '32px Comic Sans MS',
                                                                    fillStyle: 'white'}
                              ),
                              position,
                              ['hoverable','clickable'],
                              {hover: ()=>{scene.items[name].asset.layers[0].color = 'rgba(0,0,255,0.7)';
                                           scene.items[name].asset.layers[1].color = 'rgba(245,155,66,0.7)';
                                           scene.items[name].asset.layers[2].color = 'rgba(255,255,255,0.7)'},
                               unhover: ()=>{scene.items[name].asset.layers[0].color = 'rgba(0,0,255,0.3)';
                                             scene.items[name].asset.layers[1].color = 'rgba(245,155,66,0.3)';
                                             scene.items[name].asset.layers[2].color = 'rgba(255,255,255,0.3)'},
                               onClick: ()=>{scene.items[name].actions.unhover();
                                             Scene.switchTo(switchToScene);}
                              }
                  )
}