//var scenes = {};       is a global container
//var scene = scenes['name'];    is a global variable for the actual scene

//scenes['name'] = new Scene();
//...
//Scene.switchTo('name');

//this.layers =[layer_0, layer_1, ... ]  with this.layers[i] = {name_i_1: element_i_1,  name_i_2: element_i_2, ...};  layers[0] is at bottom
//element_i_j = {asset: someAsset, target: {x: int, y: int, width: int, height: int}}, where someAsset = new Sprite, new Squircle, new TextElement, new Animation, etc

//this.elementsToLayer = {name_i_j: i, name_k_m: k, ...}  


class Scene{
  constructor(){
    this.background = undefined;
    this.layers = [{}];  
    this.elementInLayer = {}; 
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

  addToLayer(i, name, element){
    while (i > this.layers.length-1){
      this.layers.push({});
    }
    this.layers[i][name] = element;
    this.elementInLayer[name] = i;
    //TODO: if not given, set width and height of element.target automatically  (eg via switch element.type  and then e.g. ctx.measureText(element.asset.text).width  or element.asset.img.width etc
  }

  pushOnTop(name, element){
    let i = this.layers.length;
    this.layers.push({});
    this.layers[i][name] = element;
    this.elementInLayer[name] = i;
  }

  getLayerOf(name){
    return this.elementInLayer[name]
  }

  setAttributes(name, attributes){   //do i need this?
    let layer = this.getLayerOf(name);
    for (const [key, value] of Object.entries(attributes)){
      this.layers[layer][name][key] = value;
    }
    
  }

  removeElement(name){
    let layer = this.getLayerOf(name);
    delete this.layers[layer][name];
    while (layer>-1 && layer==(this.layers.length-1) && Object.keys(this.layers[layer]).length == 0){
      this.layers.pop();
      layer--;
    }
    delete this.elementInLayer[name];
  }

}