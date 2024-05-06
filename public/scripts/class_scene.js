//var scenes = {};       is a global container
//var scene = scenes['name'];    is a global variable for the actual scene

//scenes['name'] = new Scene();
//...
//Scene.switchTo('name');

//this.layers =[layer_0, layer_1, ... ]  with this.layers[i] = {name_i_1: item_i_1,  name_i_2: item_i_2, ...};  layers[0] is at bottom
//item_i_j = {asset: someAsset, target: {x: int, y: int, width: int, height: int}}, where someAsset = new Sprite, new Squircle, new Textitem, new Animation, etc

//this.itemsToLayer = {name_i_j: i, name_k_m: k, ...}  


class Scene{
  constructor(){
    this.background = undefined;
    this.layers = [{}];
    this.layerOfItem = {};
    this.items = {};   //this.items.myName is short for this.layers[layerOfItem.myName].mayName    //TODO: makes layerOfItem obsolete!?!
  }

  static switchTo(nextScene){
    if (scenes.hasOwnProperty(nextScene)){
      scene = scenes[nextScene];
      if (scene.background != undefined){
        backgroundCanvas.drawImage(scene.background, new Point2D(0,0), 1);
      }
    }    
  }

  setBackground(img){
    this.background = img;
  }

  addToLayer(i, name, item){
    while (i > this.layers.length-1){
      this.layers.push({});
    }
    this.layers[i][name] = item;
    this.layerOfItem[name] = i;
    this.items[name] = this.layers[i][name];
  }

  pushOnTop(name, item){
    let i = this.layers.length;
    this.layers.push({});
    this.layers[i][name] = item;
    this.layerOfItem[name] = i;
    this.items[name] = this.layers[i][name];
  }

  getLayerOf(name){
    return this.layerOfItem[name]
  }

  setAttributes(name, attributes){   //do i need this?
    let layer = this.getLayerOf(name);
    for (const [key, value] of Object.entries(attributes)){
      this.layers[layer][name][key] = value;
    }
    
  }

  removeItem(name){
    let layer = this.getLayerOf(name);
    delete this.layers[layer][name];
    while (layer>-1 && layer==(this.layers.length-1) && Object.keys(this.layers[layer]).length == 0){
      this.layers.pop();
      layer--;
    }
    delete this.layerOfItem[name];
    delete this.items[name];
  }

}