/*
class TextElement

description:
  a simple class for drawing text to a canvas
  !constructor and method arguments must match the intented format!

constructor arguments:
  text... a string

methods:
  .draw(ctx, target): draws the text on a canvas at the targeted coordinates
      ctx... the context of the canvas to draw to, e.g. ctx=canvas.getContext('2d')
      target... a Coords object {x: int, y: int [, width: int] [, height: int]} describing the position and size of the rendered sprite on the canvas
                if width and/or height aren't given, the sprite will be drawn in its original size (this.sw and/or this.sh)

example:
let mySprite = new Sprite(preloadedImages[4], {x:40, y:120, width:20, height:20});
//better: let mySprite = newSprite(preloadedImages[4], {x:40, y:120, width:20, height:20});
mySprite.draw(ctx,{x:407, y:210, width: 40, height:40});

notes:
can be used to draw a whole image:
e.g. a preloaded image has size 200x150 and is stored as img_collection('my_image')  (see loadAssets.js how to preload images)
let img = newSprite( img_collection('my_image'), newCoords(0,0,200,150) );
img.draw(ctx, target_coords);
*/

class TextElement{
  constructor(text){
    this.text = text;
  }

  update(){}

  draw(ctx, target){
    ctx.fillText(this.text, target.x, target.y);
  }

}

