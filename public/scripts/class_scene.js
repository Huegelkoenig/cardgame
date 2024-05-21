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
    this.layers = [];
    this.items = {}; 
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