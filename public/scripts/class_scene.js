//var scenes = {};       is a global container
//var scene = scenes['name'];    is a global variable for the actual scene

//scenes['name'] = new Scene();
//...
//Scene.switchTo('name');

//this.items is a collection of all items in the scene
//this.items[name] = new Item(...)

//this.layers describes the layer of an item by using their name 
//this.layers =[layer_0, layer_1, ... ]
//    with this.layers[0] at bottom and this.layers[i] = {name_i_1,  name_i_2, ...};

//this.hovered, .pressed and .dragged is a list of all items that are currently pressed, dragged or hovered

class Scene{
  constructor(){
    this.background = undefined;
    this.layers = [];
    this.items = {};
    this.pressed = [];
    this.dragged = [];
    this.hovered = [];
    this.events = {start: ()=>{},
                   stop: ()=>{}};
    this.variables = {};
  }

  static switchTo(nextScene){
    if (scenes.hasOwnProperty(nextScene)){
      scene.events.stop();
      scene = scenes[nextScene];
      this.pressed = [];
      this.dragged = [];
      this.hovered = [];
      if (scene.background != undefined){
        backgroundCanvas.drawImage(scene.background, new Point2D(0,0), 1);
      }
      scene.events.start();
    }
  }

  setBackground(img){
    this.background = img;
  }

  addItem(name, item){
    this.items[name] = item;
    while (item.target.layer > this.layers.length-1){
      this.layers.push([]);
    }
    this.layers[item.target.layer].push(name);
  }


  changeLayer(name, newLayer){
    //delete the old layer of the item 'name'
    let idx = this.layers[scene.items[name].target.layer].indexOf(name);
    this.layers[scene.items[name].target.layer].splice(idx, 1); 
    //set layer of item 'name' to newLayer
    this.items[name].target.layer = newLayer;
    //enter 'name' into layers[newLayer]:
    //if necessary: fill layers[i] with []
    while (newLayer > this.layers.length-1){
      this.layers.push([]);
    }
    this.layers[newLayer].push(name);
    //if necessary: delete empty layers on top
    while (this.layers[this.layers.length-1].length == 0){
      this.layers.length -= 1;
    }
  }
  
  pushToTop(name){
    this.changeLayer(name, this.layers.length);
  }

  getLayerOf(name){
    return name.target.layer
  }

  removeItem(name){
    let layer = this.items[name].target.layer;
    let idx = this.layers[layer].indexOf(name);
    this.layers[layer].splice(idx, 1);
    while (layer>-1 && layer==(this.layers.length-1) && this.layers[layer].length == 0){
      this.layers.pop();
      layer--;
    }
    delete this.items[name];
  }

}