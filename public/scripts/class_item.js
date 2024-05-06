class Item{
  #target = {x: 0, y: 0};
  set target(target){
    this.#target.x = target.x;
    this.#target.y = target.y;
    if (target.hasOwnProperty('scale')){
      this.#target.scale = target.scale;
    }
    if (target.hasOwnProperty('width')){
      this.#target.width = target.width;
    }
    if (target.hasOwnProperty('height')){
      this.#target.height = target.height;
    }
    this.#target.box = {tl: new Point2D(undefined, undefined), br: new Point2D(undefined, undefined)};
    this.#setBox();
    this.#target.offset = new Point2D(0,0);
  }
  
  get target(){
    return this.#target;
  }

  set offset(offset){
    this.#target.offset.set(offset.x, offset.y);
  }

  get offset(){
    return this.#target.offset;
  }

  constructor(asset, target, $_properties=[], $_onClick = ()=>{}, $_afterDrag = ()=>{}){
    this.asset = asset;
    this.properties = {centered: false,
      clickable: false,
      bubbleclick: false,
      dragable:  false,
      bubbledrag: false};
    $_properties.forEach( (p)=>{this.properties[p] = true;} );
    this.target = target;
    this.onClick = $_onClick;
    this.afterDrag = $_afterDrag;
  }

  #setBox(){
    if (this.properties['centered']){//TODO:

    }
    else { //not centered positions //TODO: dothis first and then offset it to centerposition
      switch (this.asset.type){ //TODO: add animation, squircle, etc
        case 'sprite':
          this.#target.box.tl.set(this.#target.x, this.#target.y);
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
          this.#target.box.tl.set(this.#target.x, this.#target.y-this.#target.height);
        break;
      }
    }
    this.#target.box.br.set (this.#target.box.tl.x + this.#target.width, this.#target.box.tl.y + this.#target.height);
  }

  setProperties(props){
    for (const [property, value] of Object.entries(props)){
      this.properties[property] = value;
    }
  }

  draw(ctx){
    if (this.properties.centered){
      this.asset.drawCentered(ctx, this.target);
    }
    else{
      this.asset.draw(ctx, this.target);
    }
    
  }

}