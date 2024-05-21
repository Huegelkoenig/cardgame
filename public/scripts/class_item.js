class Item{
  #target = {x: 0, y: 0};
  set target(newTarget){
    if (newTarget.hasOwnProperty('layer')){
      this.#target.layer = newTarget.layer;
    }
    if (newTarget.hasOwnProperty('x')){
      this.#target.x = newTarget.x;
    }
    if (newTarget.hasOwnProperty('y')){
      this.#target.y = newTarget.y;
    }    
    if (newTarget.hasOwnProperty('scale')){
      this.#target.scale = newTarget.scale;
    }
    if (newTarget.hasOwnProperty('width')){
      this.#target.width = newTarget.width;
    }
    if (newTarget.hasOwnProperty('height')){
      this.#target.height = newTarget.height;
    }
    this.#target.box = {tl: new Point2D(undefined, undefined), br: new Point2D(undefined, undefined)};
    this.#setBox();
    this.#target.offset = new Point2D(0,0);
  }
  
  get target(){
    return this.#target;
  }

  set offset(newOffset){
    this.#target.offset = new Point2D(newOffset.x, newOffset.y);
  }

  get offset(){
    return this.#target.offset;
  }

  constructor(asset, target, $_properties=[], $_actions={}){
    this.asset = asset;
    this.properties = {centered: false,
                       clickable: false,
                       bubbleclick: false,
                       dragable:  false,
                       bubbledrag: false,
                       hidden: false};
    $_properties.forEach( (p)=>{this.properties[p] = true;} );
    this.target = target;  //calls 'set target' (see above) (do this after setting the properties due to .setBox() checks, if .properties.centered==true)
    this.actions = {hover: ()=>{}, unhover: ()=>{}, onClick: ()=>{}, dragStart: ()=>{}, onDrag: ()=>{}, dragEnd: ()=>{}}
    for (const [key, value] of Object.entries($_actions)){
      this.actions[key] = value;
    }
  }

  #setBox(){
    if (this.properties['centered']){//TODO:

    }
    else { //not centered positions //TODO: do this first and then offset it to centerposition
      switch (this.asset.type){ //TODO: add animation, squircle, etc
        case 'sprite':
        case 'squircle': //works for squircle only if scale is in between 0-1
          this.#target.box.tl.assign(this.#target.x, this.#target.y);
          if (this.#target.hasOwnProperty('scale')){
            this.#target.width = this.asset.origin.width*this.#target.scale;
            this.#target.height = this.asset.origin.height*this.#target.scale;
          }
          if (!this.#target.hasOwnProperty('width') || !this.#target.hasOwnProperty('height')){
            this.#target.width = this.asset.origin.width;
            this.#target.height = this.asset.origin.height;
          }
        break;
        case 'text':
          cardgameCanvas.ctx.save();
          for (const [key, value] of Object.entries(this.asset.style)){
            cardgameCanvas.ctx[key] = value;
           }
          this.#target.width = cardgameCanvas.ctx.measureText(this.asset.text).width;
          this.#target.height = parseInt(cardgameCanvas.ctx.font.split(' ')[0].replace('px','').replace('pt','')); //doesn't give the exact height, but almost. this.target.height > realHeight
          cardgameCanvas.ctx.restore();
          this.#target.box.tl.assign(this.#target.x, this.#target.y-this.#target.height);
        break;
      }
    }
    this.#target.box.br.assign(this.#target.box.tl.x + this.#target.width, this.#target.box.tl.y + this.#target.height);
  }

  setProperties(props){
    for (const [property, value] of Object.entries(props)){
      this.properties[property] = value;
    }
  }

  draw(ctx){
    if (!this.properties.hidden){
      if (this.properties.centered){//TODO:
        //this.asset.drawCentered(ctx, this.target);  
      }
      else{
        this.asset.draw(ctx, this.target);
      }
    }    
  }

}