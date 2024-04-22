/*
class Sprite

description:
  a simple class for drawing sprites
  !constructor and method arguments must match the intented format!

constructor arguments:
  img... a preloaded image object
  $_origin... a not required Coords object {x: int, y: int, width: int, height: int} describing the position and size of the sprite relative to the img
              If no $_origin is given, the new Sprite contains the whole iamge

methods:
  .draw(ctx, target): draws the sprite on a canvas at the targeted coordinates
      ctx... the context of the canvas to draw to, e.g. ctx=canvas.getContext('2d')
      target... a Coords object {x: int, y: int [,scale: float(0-1)] [, width: int] [, height: int]} describing the position and size of the rendered sprite on the canvas
                if scale is given, target.width and target.height will be calculated and overwritten, depending on the original size of the image and the given scale.
                if width or height aint given, the sprite will be drawn in its original size (this.sw and/or this.sh)

example:
let mySprite = new Sprite(preloadedImages[4], {x:40, y:120, width:20, height:20});
mySprite.draw(ctx,{x:407, y:210, width: 40, height:40});

notes:
can be used to draw a whole image:
e.g. a preloaded image has size 200x150 and is stored as img_collection('my_image')  (see loadAssets.js how to preload images)
let my_whole_img = new Sprite( img_collection('my_image'));
my_whole_img.draw(ctx, target_coords);
*/

class Sprite{
  constructor(img, $_origin=undefined){
    this.img = img;
    if ($_origin == undefined){
      $_origin = {};
      $_origin.x = 0;
      $_origin.y = 0;
      $_origin.width = this.img.width;
      $_origin.height = this.img.height;
    }
    this.origin = $_origin;    
  }

  setOrigin(origin){
    this.origin = origin;
  }

  update(){}

  draw(ctx, target){
    if (target.hasOwnProperty('scale')){
      target.width = this.origin.width*target.scale;
      target.height = this.origin.height*target.scale;
    }
    if (!target.hasOwnProperty('width') || !target.hasOwnProperty('height')){
      target.width = this.origin.width;
      target.height = this.origin.height;
    }
    ctx.drawImage(this.img, this.origin.x, this.origin.y, this.origin.width, this.origin.height, target.x, target.y, target.width, target.height);
  }

}

