//TODO: add text to fill into squirqle
//TODO: maybe add option to scale around center
//TODO: maybe add option to rotate
//TODO: add shadowBlur, ShadowColor, shadowOffsetX +Y to this

/*
contains:
class Squircle: a simple class for squircles




/*
class Squircle

description:
  a simple class for squircles
  !constructor and method arguments must match the intented format!

constructor arguments:
  layers... an array of layers, from outer to inner.
            Each layer is an object, that has the following key/value-pairs:
      roundX... amount in percent of the rounded part of the horizontal lines (roundX="rounded part in pixels"/width)
      roundY... amount in percent of the rounded part of the vertical lines (roundX="rounded parts in pixels"/width)
                roundX=roundY=100 will create an ellipse, roundX=0 or roundY=0 will create a rectangle
      scale ... size of the layer in percentage 0-1 regarding the width and heigth given in the target
      color ... the color of the layer
  $_text... (optional): an string
  $_textStyle .. (optional): style attributes for the text, like color or font


methods:
  .draw(ctx, target): draws the squircle on a canvas at the targeted coordinates
      ctx... the context of the canvas to draw to, e.g. ctx=canvas.getContext('2d')
      target... a Coords object {x: int, y: int, width: int, height: int} describing the position and size of the rendered squircle on the canvas

example:
let mySquircle = new Squircle({x:20, y:70, scale:100, color:'blue'}]);  
mySqircle.draw(ctx,{x:400, y:200, width: 300, height:100});
*/

class Squircle{
  constructor(layers, $_text='', $_textStyle={}){    
    this.type = 'squircle';
    this.layers = layers;
    this.text = $_text;
    this.textStyle = $_textStyle;
  }

  draw(ctx, target){
    ctx.save();
    let cx = target.x+target.width/2;  //center x
    let cy = target.y+target.height/2; //center y
    for (let l=0; l<this.layers.length; ++l){
      let rx = target.width * this.layers[l].scale / 2;   //radius x (width in x direction from center)
      let ry = target.height * this.layers[l].scale / 2;  //radius y (height in y direction from center)
      let lw = rx*(1-this.layers[l].roundX/100);   //1/2 of the length of the straight line on top and bottom
      let lh = ry*(1-this.layers[l].roundY/100);   //1/2 of the length of the straight line on left and right
      ctx.beginPath();
      ctx.moveTo(cx-rx+target.offset.x, cy+lh+target.offset.y);
      ctx.lineTo(cx-rx+target.offset.x,cy-lh+target.offset.y);
      ctx.ellipse(cx-lw+target.offset.x,cy-lh+target.offset.y,rx-lw,ry-lh,0,Math.PI,3*Math.PI/2)
      ctx.lineTo(cx+lw+target.offset.x,cy-ry+target.offset.y);
      ctx.ellipse(cx+lw+target.offset.x,cy-lh+target.offset.y,rx-lw,ry-lh,0,3*Math.PI/2,0);
      ctx.lineTo(cx+rx+target.offset.x,cy+lh+target.offset.y);
      ctx.ellipse(cx+lw+target.offset.x,cy+lh+target.offset.y,rx-lw,ry-lh,0,0,Math.PI/2);
      ctx.lineTo(cx-lw+target.offset.x,cy+ry+target.offset.y);
      ctx.ellipse(cx-lw+target.offset.x,cy+lh+target.offset.y,rx-lw,ry-lh,0,Math.PI/2,Math.PI);
      ctx.fillStyle = this.layers[l].color;
      ctx.fill();
      ctx.fillStyle = 'black'; //initial text style
      ctx.font = "30px Arial";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (const [key, value] of Object.entries(this.textStyle)){ //may overwrite text style
        ctx[key] = value;
      }
    }
    ctx.fillText(this.text, cx+target.offset.x, cy+target.offset.y);
    ctx.restore();
  }

  render(ctx,target){
    this.draw(ctx,target);
  }

  update(){}
}