/*
contains:
class Animation: a simple class for animations
class Animation_Collection: a class for a collection of animations (an object containing animations)
function newAnimation: checks the arguments and creates a new animation
*/

/*
class Animation

description:
  a simple class for animations
  !constructor and method arguments must match the intented format!
  !use function newAnimation() to check arguments!

constructor arguments:
  img... a preloaded image object, eg. a sprite
  origin... a Coords object {x: int, y: int, width: int, height: int} describing the position and size of the most left or top sprite relative to the img
  shift... a Coords object describing the amount of pixels the animation shifts on each step, and the change of the size of the sprite (e.g. loading bar). Usually {x:width_of_sprite, y:0, width:0, height:0}
  duration... the duration in ms each cycle of the animation shall take
  sequence... an array containing the sequence of the animation, e.g. [0,1,2,3,4] for a simple animation,   or [0,1,0,2] for 'no step', 'left foot', 'no step', 'right foot'
  innerOrigin... a Coords object that describes a part of the initial origin. Used eg, if there are gaps between different frames
                 eg: origin = {x:0, y:0, width: 100, height: 100}; innerOrigin = {x:20, y:30, width: 60, height: 50};  first sprite to drawn has origincoords(20,30,60,50), second sprite has origincoords(120,130,60,50)
  cycleShift... a Coords object describing the amount of pixels the animation shifts after each cycle
  $_repeats... (optional) the amount of repeats before the animation shall stop, standard is Infinity
  $_lastToDraw... the sprite that shall be drawn last, after the amount of cycles exceedes $_repeats
  $_callback... a function to execute after the amount of cycles exceedes $_repeats

methods:
  .draw(ctx, target): draws the actual sprite of the animation on a canvas at the targeted coordinates
      ctx... the context of the canvas to draw to, e.g. ctx=canvas.getContext('2d')
      target... an Coords object {x: int, y: int [, width: int] [, height: int]} describing the position and size of the rendered sprite on the canvas
                     if width and/or height aren't given, the sprite will be drawn in its original size (this.sw and/or this.sh)

example:
let myAnimation = new Animation(preloadedImages[2], {x:0, y:120, width:20, height:20}, 1300, 8, 0, 'normal', 0);
*/

class Animation{
  constructor(img, origin, shift, duration, sequence, $_innerOrigin=false, $_cycleShift=false, $_repeats=Infinity, $_lastToDraw=0, $_callback = ()=>{}){
    this.img = img;
    this.origin = origin;
    ($_innerOrigin === false)?(this.innerOrigin = newCoords(0,0,this.origin.width,this.origin.height)):(this.innerOrigin = $_innerOrigin);
    this.shift = shift;
    this.shift.width = this.shift.width || 0; //TODO: move to function newAnimation();
    this.shift.height = this.shift.height || 0; //TODO: move to function newAnimation();
    ($_cycleShift === false)?(this.cycleShift = newCoords(0,0,0,0)):(this.cycleShift = $_cycleShift);
    this.duration = duration;
    this.sequence = sequence;
    this.progress = 0;
    this.repeats = $_repeats;
    this.lastToDraw = $_lastToDraw; //last sprite to draw, if repeats aren't infinite
    this.callback = $_callback; //what to do, after the "last" sprite has been drawn
    this.counter = 0;
    this.cycleCounter = 0;
    this.msps = this.duration/this.sequence.length || 1; //ms per sprite
    this.now = undefined;
    this.last = undefined;
    this.dt = 0;
  }

  render(ctx, target){
    if (!this.last){
      this.last=Date.now();
    }
    this.update();
    this.draw(ctx,target); //TODO: optional consturctor argument
  }

  update(){
    if (this.cycleCounter<this.repeats){
      this.now = Date.now();
      let spritesSinceLast = Math.floor((this.now - this.last)/this.msps);
      if (spritesSinceLast){
        this.progress += spritesSinceLast;
        this.counter += spritesSinceLast;
        this.cycleCounter+= Math.floor(this.progress/this.sequence.length);
        if (this.cycleCounter>=this.repeats){
          this.progress = this.lastToDraw; 
          //this.reset(); //TODO: sets all values to the initial state
          this.callback();//TODO:
        }
        else{
         this.progress = this.progress%this.sequence.length;
        }
        this.last = this.now;
      }
    }
  }  

  draw(ctx,target){
    //TODO: delete testcoords
    let testcoords = newCoords(this.origin.x+this.sequence[this.progress]*this.shift.x+this.innerOrigin.x+this.cycleCounter*this.cycleShift.x,this.origin.y+this.sequence[this.progress]*this.shift.y+this.innerOrigin.y+this.cycleCounter*this.cycleShift.y, this.innerOrigin.width+this.counter*this.shift.width+this.cycleCounter*this.cycleShift.width, this.innerOrigin.height+this.counter*this.shift.height+this.cycleCounter*this.cycleShift.height);
    ctx.drawImage(this.img, testcoords.x, testcoords.y, testcoords.width, testcoords.height, target.x, target.y, target.width?target.width:this.origin.width, target.height?target.height:this.origin.height);
  }

  drawKeepSize(ctx,target){ //TODO:
    //TODO: delete testcoords
    let testcoords = newCoords(this.origin.x+this.sequence[this.progress]*this.shift.x+this.innerOrigin.x+this.cycleCounter*this.cycleShift.x,this.origin.y+this.sequence[this.progress]*this.shift.y+this.innerOrigin.y+this.cycleCounter*this.cycleShift.y, this.innerOrigin.width+this.counter*this.shift.width+this.cycleCounter*this.cycleShift.width, this.innerOrigin.height+this.counter*this.shift.height+this.cycleCounter*this.cycleShift.height);
    ctx.drawImage(this.img, testcoords.x, testcoords.y, testcoords.width, testcoords.height, target.x, target.y, this.origin.width+this.counter*this.shift.width+this.cycleCounter*this.cycleShift.width, this.origin.height+this.counter*this.shift.height+this.cycleCounter*this.cycleShift.height);
  }
  
  start(){

  }

  stop(){ //will stop after animationcycle finished
    this.cycleCounter = this.repeats-1;
    
  }

  stopnow(){ //will stop immediately

  }

  nextSprite(){ //will force the next sprite
    this.progress += 1;
    this.cycleCounter+= Math.floor(this.progress/this.sequence.length);
    if (this.cycleCounter>=this.repeats){//TODO:
      this.progress = this.lastToDraw; 
      this.callback();
    }
    else{
     this.progress = this.progress%this.sequence.length;
    }
    this.last = this.now;
   }

   reset(){
    this.progress = 0;
    this.repeats = $_repeats;
    this.counter = 0;
    this.cycleCounter = 0;
    this.now = undefined;
    this.last = undefined;
    this.dt = 0;
   }
}




/*
class Animation_Collection

description:
  a simple class for a collection of animations. Extends the JS-Object with additional methods to append animations to the collection.
  Animations are identified in the collection via a given name.

constructor arguments:

methods:
  .append(name, animation[, $_force=false]): appends a animation object to the collection
      name... the name by which a animation is identified in the collection 
      animation... an object of the Animation class
      $_force... (optional), if set to true, the method .forceAppend() will be executed. standard is false: if a animation with the same name already existst in the collection, an Error will be thrown
  .forceAppend(name, animation):  appends a animation object to the collection, overwrites existing animations with the same name
      name... the name by which a animation is identified in the collection 
      animation... an object of the Animation class

example:
let enemys = new Animation_Collection();
let myAnimation = new Animation('dogs.png',{x:0,y:240,width:70,height:40});  //(or use newCoords(0,240,70,40) istead of {...})
enemys.append('haunting_dog', myAnimation);
enemys.append('haunting_dog', anotherAnimation);  //throws an error, bc there's already a animation called 'haunting_dog'
enemys.append('haunting_dog', anotherAnimation, true);  //will overwrite the existing animation called 'haunting_dog',  equals .forceAppend(...)
*/

class Animation_Collection extends Object{
  constructor(){
    super();
  }

  append(name, animation, $_force=false){
    if (this[name] && !$_force){
      throw new Error(`class_animation.js: Animation_Collection.append():\nYour Animation_Collection ${this} has already an element called ${name}.\n${this}.append() was aborted.\n If you want to ignore existing animations, use\n.append(name,animation,true) or\n.forceAppend(name,animation)`);
    }
    else{
      this.forceAppend(name,animation);
    }
  }

  forceAppend(name, animation){
    delete this[name];
    this[name] = animation;
  }

  renderAll(){
    //TODO:
  }
}



/*
function newAnimation(//TODO:)

description:
  checks the arguments and creates a new animation

arguments:
  //TODO:

return:
  if arguments are ok, an animation object will be returned, else an error will be thrown
*/

function newAnimation(insert, arguments){ //TODO:

}
