class Item{
  constructor(asset, target, $_centered = false){
    this.asset = asset;
    this.target = target;
    this.centered = $_centered;
    this.box = {tl: new Point2D(undefined, undefined), br: new Point2D(undefined, undefined)}
    this.setBox();
  }

  setBox(){
    if (this.centered){//TODO: 

    }
    else {
      switch (this.asset.type){
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


}