/*
contains:
class Item: a class to store app objects like images, texts, animations, buttons, etc including their position on screen and their behavior onclick, onhover, etc
class Item_Collection: a class for a collection of items (an Object containing items)
function newItem: checks the arguments and creates a new item
*/

/*
class Item

description:
  a class that transforms an app object of a abstract class like an image, a sprite, an animation, etc into an app-item that show on screen.
  Along the object itself, informations about screen target position, interactivity etc are stored.

constructor arguments:
  obj... the object itself, can be e.g a member of class_Animation(), class_Sprite, class_Squircle, etc
  target... a Coords object, describing the position on screen
  $_layer... (optional) the canvas.context to draw to, standard is 'ctx'
  $_status... (optional) any additional information can be stored here, eg this.status = {zIndex: 1, hidden: true, }
  $_mouseclick... (optional) defines what to do, when this item is clicked
  $_mousedown... (optional) defines what to do, when this item is mousedowned upon
  $_mouseup... (optional) defines what to do, when this item is mouseuped upon
  $_mouseover... (optional) defines what to do, when this item is hovered over  
  $_mouseout... (optional) defines what to do, when this item is hovered out
      $_mouseclick , ... , $_mouseout are either: - undefined, then nothing happens when the corresponding event happens
                                            - a function, which is called when the event happens
                                            - an object {bubbling: boolean, func:function}
                                                the function func will be called when the event happens. If bubbling===true the event can e.g be bubbled down to the next lower status.zIndex item
                                                exact behavior must be coded into the corresponding eventListener

methods:
  .set obj(obj)... setter and
  .get obj... getter for the argument obj. set obj(obj) makes sure, that a new copy of the given obj will be created (instead of just referencing to the old object)

example:
let myItem = new Item(animationCollection[4], {x:400, y:250, width:160, height:90}, ctx-background, undefined, {bubbling: true, func:this.obj.start()});
*/

class Item{
  constructor(obj={}, target=newCoords(0,0,0,0), $_layer=ctx, $_status=false, $_debugsomethinghere, $_mouseclick=undefined, $_mousedown=undefined, $_mouseup=undefined, $_mouseover=undefined, $_mouseout=undefined){
    this.obj = obj;
    this.target = target;
    this.layer = $_layer;
    this.status = $_status;
    this.clickable = Boolean($_mouseclick);
    this.clickbubbling = this.clickable?Boolean($_mouseclick.bubbling):false;
    this.mouseclick = this.clickable?(this.clickbubbling?$_mouseclick.func:$_mouseclick):()=>{};
    this.mousedownable = Boolean($_mousedown);
    this.mousedownbubbling = this.mousedownable?Boolean($_mousedown.bubbling):false;
    this.mousedown = this.mousedownable?(this.mousedownbubbling?$_mousedown.func:$_mousedown):()=>{};
    this.mouseupable = Boolean($_mouseup);
    this.mouseupbubbling = this.mouseupable?Boolean($_mouseup.bubbling):false;
    this.mouseup = this.mouseupable?(this.mouseupbubbling?$_mouseup.func:$_mouseup):()=>{};
    this.mouseoverable = Boolean($_mouseover);
    this.mouseoverbubbling = this.mouseoverable?Boolean($_mouseover.bubbling):false;
    this.mouseover = this.mouseoverable?(this.mouseoverbubbling?$_mouseover.func:$_mouseover):()=>{};
    this.mouseoutable = Boolean($_mouseout);
    this.mouseoutbubbling = this.mouseoutable?Boolean($_mouseout.bubbling):false;
    this.mouseout = this.mouseoutable?(this.mouseoutbubbling?$_mouseout.func:$_mouseout):()=>{};
    this.hovered = false;
  }

  set obj(obj){
    this._obj_ = Object.assign( Object.create( Object.getPrototypeOf(obj)),obj);
  }

  get obj(){
    return this._obj_
  }
}



/*
class Item_Collection

description:
  a simple class for a collection of items. Extends the JS-Object with additional methods to append items to the collection.
  Items are identified in the collection via a given name.

constructor arguments:

methods:
  .append(name, item[, $_force=false]): appends an item object to the collection
      name... the name by which the item is identified in the collection 
      item... an object of the Item class
      $_force... (optional), if set to true, the method .forceAppend() will be executed. standard is false: if an item with the same name already existst in the collection, an Error will be thrown
  .forceAppend(name, item):  appends an item object to the collection, overwrites existing items with the same name
      name... the name by which the item is identified in the collection 
      item... an object of the Item class

example:
let mainMeni = new Item_Collection();
mainMenu.append('backgroundImage', newItem( backgroundImage, newCoords(0,0,800,600), background-ctx, {zIndex: 0}) );
mainMenu.append('startGameButton', newItem(new Squircle(...), newCoords(300,100,200,50), ctx, {zIndex:1}, ()=>startgame(), undefined, undefined, ()=>hoverStartButton(), ()=>unhoverStartButton()) );
mainMenu.append('optionsButton', newItem( new Squircle(...), newCoords(300,200,200,50), ctx, {zIndex:1}, ()=>showOptionsMenu()) );
mainMenu.append('mainMenuAnimation', newItem( new Animation(...), newCoords(0,400,800,200), ctx, {zIndex:1}) );
*/

class Item_Collection extends Object{
  constructor(){
    super();
  }

  append(name, item, $_force=false){
    if (this[name] && !$_force){
      throw new Error(`class_item.js: item_Collection.append():\nYour Item_Collection ${this} has already an element called ${name}.\n${this}.append() was aborted.\n If you want to ignore existing items, use\n.append(name,item,true) or\n.forceAppend(name,item)`);
    }
    else{
      this.forceAppend(name,item);
    }
  }

  forceAppend(name, item){
    delete this[item];
    this[name] = item;
  }

  render(){
    Object.values(this).forEach((obj)=>{
      obj.obj.render(obj.layer, obj.target);
    });
  }
}



function newItem(){
  //TODO: may  check the arguments
  return new Item(...arguments);
}