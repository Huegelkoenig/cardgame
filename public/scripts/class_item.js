class Item{
  constructor(obj={}, target=newCoords(0,0,0,0), status=false, $_layer=ctx, $_zIndex=0, $_mouseclick=undefined, $_mousedown=undefined, $_mouseup=undefined, $_mouseover=undefined, $_mouseout=undefined){
    this.obj = Object.assign( Object.create( Object.getPrototypeOf(obj)),obj);
    this.target = target;
    this.status = status;
    this.layer = $_layer;
    this.zIndex = $_zIndex
    this.clickable = Boolean($_mouseclick);
    this.clickbubble = this.clickable?Boolean($_mouseclick.bubbling):false;
    this.mouseclick = this.clickable?(this.clickbubble?$_mouseclick.f:$_mouseclick):()=>{};
    this.mousedownable = Boolean($_mousedown);
    this.mousedown = this.mousdownable?$_mousedown:()=>{};
    this.mouseupable = Boolean($_mouseup);
    this.mouseup = this.mouseupable?$_mouseup:()=>{};
    this.mouseoverable = Boolean($_mouseover);
    this.mouseover = this.mouseoverable?$_mouseover:()=>{};
    this.mouseoutable = Boolean($_mouseout);
    this.mouseout = this.mouseoutable?$_mouseout:()=>{};
    this.hovered = false;
  }

}



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
  //TODO: argment checks
  return new Item(...arguments);
}