class Item{
  constructor(obj={}, target=newCoords(0,0,0,0), status=false, $_layer=0, $_clicked= ()=>{}, $_mousedown= ()=>{}, $_mouseup= ()=>{}, $_mouseover= ()=>{}, $_mouseout= ()=>{}){
    this.obj = Object.assign( Object.create( Object.getPrototypeOf(obj)),obj);
    this.target = target;
    this.status = status;
    this.layer = $_layer;
    this.clicked = $_clicked;
    this.mousedown = $_mousedown;
    this.mouseup = $_mouseup;
    this.mouseover = $_mouseover;
    this.mouseout = $_mouseout;
    this.hover = false;
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