//var scenes = {};       is a global container
//var scene = scenes['name'];    is a global variable for the actual scene

//scenes['name'] = new Scene();
//...
//Scene.switchTo('name');


class Scene{
  constructor(){
    this.background = undefined;
    this.layers = [];  //this.layer[i] = {name1: image,  name2: animation, name3: squirqle, ...};  layer 0 is bottom
    this.elements = {}; //this.elements[name] = layer_i;
  }

  static switchTo(nextScene){
    if (scenes.hasOwnProperty(nextScene)){
      scene = scenes[nextScene];
      backgroundCanvas.drawImage(scene.background, new Point2D(0,0), 1);
    }    
  }

  setBackground(img){
    this.background = img;
  }

  pushElementToLayer(i, name, element){
    this.layers[i][name] = element;
    this.elements[name] = i;
  }

  pushToTopLayer(name, element){
    let i = this.layers.size;
    this.layers[i][name] = element;
    this.elements[name] = i;
  }

  getLayerOf(name){
    return this.elements[name]
  }

  removeElement(name){
    delete this.layers[this.getLayerOf(name)][name];
    delete this.elements[name];
  }

}