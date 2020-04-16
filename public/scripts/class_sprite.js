/*
contains:
class Sprite: a simple class for sprites
class Sprite_Collection: a class for a collection of sprites (an object with additional methods containing sprites)
function newSprite: checks if arguments have the intented format and creates a new sprite
*/



/*
class Sprite

description:
  a simple class for sprites
  !constructor and method arguments must match the intented format!
  !use function newSprite() to check arguments!

constructor arguments:
  img... a preloaded image object
  origin... a Coords object {x: int, y: int, width: int, height: int} describing the position and size of the sprite relative to the img

methods:
  .draw(ctx, target): draws the sprite on a canvas at the targeted coordinates
      ctx... the context of the canvas to draw to, e.g. ctx=canvas.getContext('2d')
      target... a Coords object {x: int, y: int [, width: int] [, height: int]} describing the position and size of the rendered sprite on the canvas
                if width and/or height aren't given, the sprite will be drawn in its original size (this.sw and/or this.sh)

example:
let mySprite = new Sprite(preloadedImages[4], {x:40, y:120, width:20, height:20});
//better: let mySprite = newSprite(preloadedImages[4], {x:40, y:120, width:20, height:20});
mySprite.draw(ctx,{x:407, y:210, width: 40, height:40});

notes:
can be used to draw a whole image:
e.g. a preloaded image has size 200x150 and is stored as img_collection('my_image')  (see class_asset.js how to preload images and use img_collection)
let img = newSprite( img_collection('my_image'), newCoords(0,0,200,150) );
img.draw(ctx, target_coords);
*/

class Sprite{
  constructor(img, origin){
    this.img = img;
    this.origin = origin;
  }

  draw(ctx,target){
    ctx.drawImage(this.img, this.origin.x, this.origin.y, this.origin.width, this.origin.height, target.x, target.y, target.width?target.width:this.origin.width, target.height?target.height:this.origin.height);
  }

  render(ctx,target){
    this.draw(ctx,target);
  }
}



/*
class Sprite_Collection

description:
  a simple class for a collection of sprites. Extends the JS-Object with additional methods to append sprites to the collection
  Sprites are identified in the collection via a given name
  !constructor and method arguments must match the intented format!
  !checks for argument types aren't implemented, yet!

constructor arguments:
  - none - 

methods:
  .append(name, sprite[, $_force=false]): appends a sprite object to the collection
      name... the name by which a sprite is identified in the collection 
      sprite... an object of the Sprite class
      $_force... (optional), if set to true, the method .forceAppend() will be executed. standard is false: if a sprite with the same name already existst in the collection, an Error will be thrown
  .forceAppend(name, sprite):  appends a sprite object to the collection, overwrites existing sprites with the same name
      name... the name by which a sprite is identified in the collection 
      sprite... an object of the Sprite class

example:
let backgrounds = new Sprite_Collection();
let mySprite = new Sprite('backgrounds.png',{x:20,y:60,width:20,height:20});
backgrounds.append('green_gras', mySprite);
backgrounds.append('green_gras', anotherSprite);  //throws an error, bc there's already a sprite called 'green_gras'
backgrounds.append('green_gras', anotherSprite, true);  //will overwrite the existing sprite called 'green_gras',  equals .forceAppend(...)
*/

class Sprite_Collection extends Object{
  constructor(){
    super();
  }

  append(name, sprite, $_force=false){
    if ($_force || !this[name]){
      this.forceAppend(name,sprite);
    }
    else{
      throw new Error(`class_sprite.js: Sprite_Collection.append():\nYour Sprite_Collection ${this} has already an element called ${name}.\n${this}.append() was aborted.\n If you want to ignore existing sprites, use\n.append(name,sprite,true) or\n.forceAppend(name,sprite)`);      
    }
  }

  forceAppend(name, sprite){
    delete this[name];
    this[name] = sprite;
  }
}



/*
function newSprite(img, origin)

description:
  checks the arguments and creates a new sprite

arguments:
  img... should be an preloaded image
  origin... should be an coords object of the format {x: int, y: int, width: int, height: int}

return:
  if arguments are ok, a sprite object will be returned, else an error will be thrown
*/

function newSprite(img, origin){
  //NOTE: img could be any object with attributes .nodeName='IMG' and .complete=true. There's no way to check, if img is really an image.
  if (!img){
    throw Error(`class_sprite.js: function newSprite: image is undefined`);
  }
  if (!('nodeName' in img)){
    throw Error(`class_sprite.js: function newSprite: ${img} is not an image (error 1/2)`);
  }
  if (!(img.nodeName==='IMG')){
      throw Error(`class_sprite.js: function newSprite: ${img} is not an image (error 2/2)`);
  }
  if (!img.complete){
    throw Error(`class_sprite.js: function newSprite: ${img} isn't fully preloaded (or not even an image)`)
  }
  if (!Number.isInteger(origin.x) || !Number.isInteger(origin.y) || !Number.isInteger(origin.width) || !Number.isInteger(origin.height) || !(origin.x>=0) || !(origin.x<img.width)|| !(origin.x+origin.width<=img.width) || !(origin.y>=0)  || !(origin.y<img.height) || !(origin.y+origin.height<=img.height)){
      throw Error(`class_sprite.js: function newSprite: Sprite dimensions exceed source image dimension`);
  }
  return new Sprite(img, origin);
}