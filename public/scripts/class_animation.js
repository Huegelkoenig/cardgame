/*
contains:
class Animation: a simple class for animations
class Animation_Collection: a class for a collection of animations (an object containing animations)
function newAnimation: checks the arguments and creates a new animation
*/

/*
class Animation

description:
  a class for animations. This includes sprite animations as well as "shifting animations" (e.g. a moving background).
  This class only handles the part, what the animations show, not where to show them and in wich size (handled by the target argument) 
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
  $_extraShift... (optional) a special kind of shift, which can be invoked anytime
  $_repeats... (optional) the amount of repeats before the animation shall stop, standard is Infinity
  $_lastToDraw... (optional) the position in the sequence that shall be drawn, after the amount of cycles exceedes $_repeats
  $_callback... (optional) a function to execute after the amount of cycles exceedes $_repeats
  $_cycleCallback... (optional) a function to execute after each cycle

methods:
  .render()
  .update()
  .draw(ctx, target): draws the actual sprite of the animation on a canvas at the targeted coordinates
      ctx... the context of the canvas to draw to, e.g. ctx=canvas.getContext('2d')
      target... an Coords object {x: int, y: int [, width: int] [, height: int]} describing the position and size of the rendered sprite on the canvas
                     if width and/or height aren't given, the sprite will be drawn in its original size (this.sw and/or this.sh)

example:
let myAnimation = new Animation(preloadedImages[2], {x:0, y:120, width:20, height:20}, 1300, 8, 0, 'normal', 0);
*/

class Animation{
  constructor(img, origin, shift, duration, sequence, $_innerOrigin=false, $_cycleShift=false, $_extraShift=false, $_repeats=Infinity, $_lastToDraw=0, $_callback = ()=>{}, $_cycleCallback = ()=>{}){
    this.img = img;
    this.origin = origin;
    this.shift = shift;
    this.duration = duration;
    this.sequence = sequence;
    ($_innerOrigin === false)?(this.innerOrigin = newCoords(0,0,this.origin.width,this.origin.height)):(this.innerOrigin = $_innerOrigin);
    ($_cycleShift === false)?(this.cycleShift = newCoords(0,0,0,0)):(this.cycleShift = $_cycleShift);
    ($_extraShift === false)?(this.extraShift = newCoords(0,0,0,0)):(this.extraShift = $_extraShift);
    this.repeats = $_repeats;
    this.lastToDraw = $_lastToDraw; 
    this.callback = $_callback; 
    this.progress = 0; //the actual progress of the sequence: this.sequence[this.progress]
    this.counter = 0; //a counter how often the progress changed overall
    this.cycleCounter = 0; // a counter how often the progress changed during this cycle
    this.msps = this.duration/this.sequence.length || 1; //ms per sprite (ms until "next frame")
    this.now = undefined; //the actual time (init only when animation starts)
    this.last = undefined; //the time when the last frame was drawn (init only when animation starts)
    this.running=false;  //true, if the animation is running
    this.stopCycleVal=false;
    this.callbackValue;
  }

  render(ctx, target){
    if (this.running){
      this.update();
      this.draw(ctx,target);
    }
    else{ //TODO: maybe render(ctx,target,forcedraw=false) ??
      this.draw(ctx,target)
    }
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
          this.callback(this.callbackValue);//TODO:
        }
        else{
         this.progress = this.progress%this.sequence.length;
        }
        this.last = this.now;
      }
    }
  }  

  draw(ctx,target){
    ctx.drawImage(this.img,
      this.origin.x+this.sequence[this.progress]*this.shift.x+this.innerOrigin.x+this.cycleCounter*this.cycleShift.x+this.extraShift.x,
      this.origin.y+this.sequence[this.progress]*this.shift.y+this.innerOrigin.y+this.cycleCounter*this.cycleShift.y+this.extraShift.y,
      this.innerOrigin.width+this.counter*this.shift.width+this.cycleCounter*this.cycleShift.width+this.extraShift.width,
      this.innerOrigin.height+this.counter*this.shift.height+this.cycleCounter*this.cycleShift.height+this.extraShift.height,
      target.x, target.y, target.width?target.width:this.origin.width, target.height?target.height:this.origin.height);
  }
  
  start(cbv){ //starts the animation
    this.callbackValue = cbv;
    this.last=Date.now();
    this.running = true;
  }

  stop(){ //stops the animation immediatelly
    this.running = false;
    this.reset();
  }

  stopCycle(){
    //TODO: maybe with Proxys
  }

  pause(){

  }


  nextSprite(){ //will force the next sprite
    this.progress += 1;
    this.cycleCounter+= Math.floor(this.progress/this.sequence.length);
    if (this.cycleCounter>=this.repeats){//TODO: stop animation etc
      this.progress = this.lastToDraw; 
      this.callback();
    }
    else{
     this.progress = this.progress%this.sequence.length;
    }
    this.last = this.now;
   }

   reset(){ //resets the progress values
    this.progress = 0;
    this.counter = 0;
    this.cycleCounter = 0;
    this.now = undefined;
    this.last = undefined;
    this.stopCycleVal = false;
   }

   resetCycle(){

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
function newAnimation(img, origin, shift, duration, sequence, $_innerOrigin=false, $_cycleShift=false, $_extraShift=false, $_repeats=Infinity, $_lastToDraw=0, $_callback = ()=>{})

description:
  checks the arguments and creates a new animation

arguments:
  img... a preloaded image object, eg. a sprite
  origin... a Coords object {x: int, y: int, width: int, height: int} describing the position and size of the most left or top sprite relative to the img
  shift... a Coords object describing the amount of pixels the animation shifts on each step, and the change of the size of the sprite (e.g. loading bar). Usually {x:width_of_sprite, y:0, width:0, height:0}
  duration... the duration in ms each cycle of the animation shall take
  sequence... an array containing the sequence of the animation, e.g. [0,1,2,3,4] for a simple animation,   or [0,1,0,2] for 'no step', 'left foot', 'no step', 'right foot'
  innerOrigin... a Coords object that describes a part of the initial origin. Used eg, if there are gaps between different frames
                 eg: origin = {x:0, y:0, width: 100, height: 100}; innerOrigin = {x:20, y:30, width: 60, height: 50};  first sprite to drawn has origincoords(20,30,60,50), second sprite has origincoords(120,130,60,50)
  cycleShift... a Coords object describing the amount of pixels the animation shifts after each cycle
  $_extraShift... (optional) a special kind of shift, which can be invoked anytime
  $_repeats... (optional) the amount of repeats before the animation shall stop, standard is Infinity
  $_lastToDraw... (optional) the sprite that shall be drawn last, after the amount of cycles exceedes $_repeats
  $_callback... (optional) a function to execute after the amount of cycles exceedes $_repeats

return:
  if arguments are ok, an animation object will be returned, else an error will be thrown
*/

function newAnimation(img, origin, shift, duration, sequence, $_innerOrigin=false, $_cycleShift=false, $_extraShift=false, $_repeats=Infinity, $_lastToDraw=0, $_callback = ()=>{}){
  if (!img){
    throw Error(`class_animation.js: function newAnimation: image is undefined`);
  }
  if (!('nodeName' in img)){
    throw Error(`class_animation.js: function newAnimation: ${img} is not an image (error 1/2)`);
  }
  if (!(img.nodeName==='IMG')){
      throw Error(`class_animation.js: function newAnimation: ${img} is not an image (error 2/2)`);
  }
  if (!img.complete){
    throw Error(`class_animation.js: function newAnimation: ${img} isn't fully preloaded (or not even an image)`)
  }
  if (!Number.isInteger(origin.x) || !Number.isInteger(origin.y) || !Number.isInteger(origin.width) || !Number.isInteger(origin.height) || !(origin.x>=0) || !(origin.x<img.width)|| !(origin.x+origin.width<=img.width) || !(origin.y>=0)  || !(origin.y<img.height) || !(origin.y+origin.height<=img.height)){
      throw Error(`class_animation.js: function newAnimation: Sprite dimensions exceed source image dimension`);
  }
  if (!Number.isInteger(shift.x) || !Number.isInteger(shift.y) || !Number.isInteger(shift.width) || !Number.isInteger(shift.height) || !(shift.x>=0) || !(shift.x<img.width)|| !(origin.x+shift.width<=img.width) || !(shift.y>=0)  || !(shift.y<img.height) || !(origin.y+shift.height<=img.height)){
    throw Error(`class_animation.js: function newAnimation: shift exceeds source image dimension`);
  }
  if (!Number.isFinite(duration) || !(duration>0)){
    throw Error(`class_animation.js: function newAnimation: duration is not a number or <= 0`);
  }
  if (!Array.isArray(sequence) || !sequence.every((entry)=>{return (Number.isInteger(entry) && entry>=0)})){  //TODO: doens't check for too large entries
    throw Error(`class_animation.js: function newAnimation: sequence is invalid`);
  }
  if ($_innerOrigin && ( !Number.isInteger($_innerOrigin.x) || !Number.isInteger($_innerOrigin.y) || !Number.isInteger($_innerOrigin.width) || !Number.isInteger($_innerOrigin.height) || !($_innerOrigin.x>=0) || !($_innerOrigin.x<origin.width)|| !($_innerOrigin.x+$_innerOrigin.width<=origin.width) || !($_innerOrigin.y>=0)  || !($_innerOrigin.y<origin.height) || !($_innerOrigin.y+$_innerOrigin.height<=origin.height))){
    throw Error(`class_animation.js: function newAnimation: $_innerOrigin dimension exceed origin dimension`);
  }
  if ($_cycleShift && ( !Number.isInteger($_cycleShift.x) || !Number.isInteger($_cycleShift.y) || !Number.isInteger($_cycleShift.width) || !Number.isInteger($_cycleShift.height) || !(origin.x+$_cycleShift.x>=0) || !(origin.x+$_cycleShift.x<img.width)|| !(origin.x+$_cycleShift.width<=img.width) || !(origin.y+$_cycleShift.y>=0) || !(origin.y+$_cycleShift.y<img.height) || !(origin.y+$_cycleShift.height<=img.height))){
    throw Error(`class_animation.js: function newAnimation: $_cycleShift exceeds source image dimension`);
  }
  if ($_extraShift && ( !Number.isInteger($_extraShift.x) || !Number.isInteger($_extraShift.y) || !Number.isInteger($_extraShift.width) || !Number.isInteger($_extraShift.height) || !(origin.x+$_extraShift.x>=0) || !(origin.x+$_extraShift.x<img.width)|| !(origin.x+$_extraShift.width<=img.width) || !(origin.y+$_extraShift.y>=0) || !(origin.y+$_extraShift.y<img.height) || !(origin.y+$_extraShift.height<=img.height))){
    throw Error(`class_animation.js: function newAnimation: $_cycleShift exceeds source image dimension`);
  }
  if ($_repeats && $_repeats !== Infinity && (!Number.isInteger($_repeats) || !($_repeats>0))){
    throw Error(`class_animation.js: function newAnimation: $_repeats is not an integer or <= 0`);
  }
  if ($_lastToDraw && (!Number.isInteger($_lastToDraw) || !($_lastToDraw>0))){
    throw Error(`class_animation.js: function newAnimation: $_lastToDraw is not an integer or <= 0`);
  }

  return new Animation(img, origin, shift, duration, sequence, $_innerOrigin, $_cycleShift, $_extraShift, $_repeats, $_lastToDraw, $_callback);
}
