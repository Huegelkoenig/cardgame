class Item{
  constructor(asset, target, $_initialProperties=[], $_click = ()=>{}, $_drag = ()=>{}){
    this.asset = asset;
    this.target = target;
    this.properties = {centered: false,
                       clickable: false,
                       bubbleclick: false,
                       dragable:  false,
                       bubbledrag: false};
    this.box = {tl: new Point2D(undefined, undefined), br: new Point2D(undefined, undefined)};
    this.setBox();
    $_initialProperties.forEach( (p)=>{this.properties[p] = true;} );
    this.offset = new Point2D();
    this.onClick = $_click;
    this.afterDrag = $_drag;
  }

  setBox(){
    if (this.properties['centered']){//TODO: 

    }
    else {
      switch (this.asset.type){ //TODO: add animation, squircle, etc
        case 'sprite':
          this.box.tl.x = this.target.x;
          this.box.tl.y = this.target.y;
          if (this.target.hasOwnProperty('scale')){
            this.target.width = this.asset.origin.width*this.target.scale;
            this.target.height = this.asset.origin.height*this.target.scale;
          }
          if (!this.target.hasOwnProperty('width') || !this.target.hasOwnProperty('height')){
            this.target.width = this.asset.origin.width;
            this.target.height = this.asset.origin.height;
          }
        break;
        case 'text':
          cardgameCanvas.ctx.save();
          for (const [key, value] of Object.entries(this.asset.style)){
            cardgameCanvas.ctx[key] = value;
           }
          this.target.width = cardgameCanvas.ctx.measureText(this.asset.text).width;
          this.target.height = parseInt(cardgameCanvas.ctx.font.split(' ')[0].replace('px','').replace('pt','')); //doesn't give the exact height, but almost. this.target.height > realHeight
          cardgameCanvas.ctx.restore();          
          this.box.tl.x = this.target.x;
          this.box.tl.y = this.target.y-this.target.height;
        break;
      }
    }
    this.box.br.x = this.box.tl.x + this.target.width;
    this.box.br.y = this.box.tl.y + this.target.height;
  }

  setTarget(target){
    this.target = target;
    this.setBox();
  }

  setOffset(offset){
    this.offset.x = offset.x;
    this.offset.y = offset.y;
  }

  setProperties(props){
    for (const [property, value] of Object.entries(props)){
      this.properties[property] = value;
    }
  }

  draw(ctx){
    this.asset.draw(ctx, this.target, this.offset);
  }

}