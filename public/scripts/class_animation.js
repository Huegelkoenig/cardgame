

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
  sequence... an array containing the sequence of the animation, e.g. [0,1,2,3,4] for a simple animation,   or [0,1,0,2] for e.g. 'no step', 'left foot', 'no step', 'right foot'
  $_innerOrigin... (optional) a Coords object that describes a part of the initial origin. Used eg, if there are gaps between different frames
                 eg: origin = {x:0, y:0, width: 100, height: 100}; innerOrigin = {x:20, y:30, width: 60, height: 50};  first sprite to drawn has origincoords(20,30,60,50), second sprite has origincoords(120,130,60,50)
                 if false, innerOrigin will be set to {x:0,y:0,width: this.origin.width, height:this.origin.height}
  $_cycleShift... (optional) a Coords object describing the amount of pixels the animation shifts after each cycle
  $_extraShift... (optional) a special kind of shift, which can be invoked anytime
  $_startCallback... (optional) a function to execute when teh animation starts
  $_repeats... (optional) the amount of repeats before the animation shall stop, standard is Infinity
  $_lastToDraw... (optional) the position in the sequence that shall be drawn, after the amount of cycles exceedes $_repeats
  $_finalCallback... (optional) a function to execute after the amount of cycles exceedes $_repeats
  $_cycleCallback... (optional) a function to execute after each cycle
  $_hidden... (optional) i hidden===true, the animation will continue, but not be drawn

methods:
  .update()
  .draw(ctx, target): draws the actual sprite of the animation on a canvas at the targeted coordinates
      ctx... the context of the canvas to draw to, e.g. ctx=canvas.getContext('2d')
      target... an Coords object {x: int, y: int [, width: int] [, height: int]} describing the position and size of the rendered sprite on the canvas
                     if width and/or height aren't given, the sprite will be drawn in its original size (this.sw and/or this.sh)
  .start(): starts the animation
  .stop(): stops the animation immediatelly and resets all values to the initial state via .reset() (see below)
  .stopCycle(): calls .stop() after the actual cycle finished
  .pause(): pauses the animation without resetting it
  .resume(): resumes the animation. If the animation hasn't started yet, .start() will be called
  .show(): unhides the animation
  .hide(): hides the animation, but doesnt stp or pause it
  .nextSprite(): the next sprite in the animation sequence will be called
  .reset(): the animation will be reseted to the initial state
  .change(newAnim, $_start=false): changes the animation to a new one
      newAnim... an Animation object
      $_start... (optional) if true, the new animation will be started, standard is false

example:
let myAnimation = new Animation(preloadedImage, {x:0, y:120, width:60, height:60}, 1300, 8, 0, 'normal', 0);
*/

class Animation{
  constructor(img, duration, origin, shift, sequence, $_repeats=Infinity, $_innerOrigin=undefined, $_cycleShift=undefined, $_extraShift=undefined, $_startCallback=()=>{},  $_lastToDraw=0, $_finalCallback= ()=>{}, $_cycleCallback= ()=>{}, $_hidden = false){
    this.type = 'animation';
    this.img = img;
    this.origin = new Coords(origin.x, origin.y, origin.width, origin.height);
    this.shift = new Coords(shift.x, shift.y, shift.width, shift.height);
    this.duration = duration;
    this.sequence = sequence;
    this.innerOrigin = ($_innerOrigin == undefined) ? (new Coords(0,0,this.origin.width,this.origin.height)) : new Coords($_innerOrigin.x, $_innerOrigin.y, $_innerOrigin.width, $_innerOrigin.height);
    this.cycleShift =  ($_cycleShift  == undefined) ? (new Coords(0,0,0,0)) : new Coords($_cycleShift.x, $_cycleShift.y, $_cycleShift.width, $_cycleShift.height);
    this.extraShift =  ($_extraShift  == undefined) ? ( new Coords(0,0,0,0)) : new Coords($_extraShift.x, $_extraShift.y, $_extraShift.width, $_extraShift.height);
    this.startCallback = $_startCallback;
    this.repeats = $_repeats;
    this.lastToDraw = $_lastToDraw; 
    this.finalCallback = $_finalCallback;
    this.cycleCallback = $_cycleCallback;
    this.progress = 0; //the actual progress of the sequence: this.sequence[this.progress]
    this.counter = 0; //a counter how often the progress changed overall
    this.cycleCounter = 0; // a counter how often the progress changed during this cycle
    this.msps = this.duration/this.sequence.length || 1; //ms per sprite (ms until "next frame")
    this.now = undefined; //the actual time (init only when animation starts)
    this.last = undefined; //the time when the last frame was drawn (init only when animation starts)
    this.running=false;  //true, if the animation is running
    this.stopCycleVal=false;
    //this.finalCallbackArguments;
    this.hidden = $_hidden;
    this.started = false;
    this.initial = {
      origin: new Coords(origin.x, origin.y, origin.width, origin.height),
      shift: new Coords(shift.x, shift.y, shift.width, shift.height),
      duration: duration,
      sequence: [...sequence],
      repeats: $_repeats,
      innerOrigin: new Coords(this.innerOrigin.x, this.innerOrigin.y, this.innerOrigin.width, this.innerOrigin.height),
      cycleShift: new Coords(this.cycleShift.x, this.cycleShift.y, this.cycleShift.width, this.cycleShift.height),
      extraShift: new Coords(this.extraShift.x, this.extraShift.y, this.extraShift.width, this.extraShift.height),
      startCallback: $_startCallback,
      lastToDraw: $_lastToDraw,
      finalCallback: $_finalCallback,
      cycleCallback: $_cycleCallback,
      hidden: $_hidden
    }
  }

  
  update(){
    if (this.running){
      if (this.cycleCounter<this.repeats){
        this.now = Date.now();
        let spritesSinceLast = Math.floor((this.now - this.last)/this.msps);
        if (spritesSinceLast){
          let cC = this.cycleCounter;
          this.progress += spritesSinceLast;
          this.counter += spritesSinceLast;
          this.cycleCounter+= Math.floor(this.progress/this.sequence.length);
          if (this.cycleCounter>cC){
            this.cycleCallback();
          }
          if (this.cycleCounter>=this.repeats){
            this.progress = this.lastToDraw;
            //this.reset(); //TODO: sets all values to the initial state
            this.finalCallback();//TODO:
          }
          else{
           this.progress = this.progress%this.sequence.length;
          }
          this.last = this.now;
        }
      }
    }
  }  


  draw(ctx, target){
    if (!this.hidden){
      ctx.drawImage(this.img,
        this.origin.x+this.sequence[this.progress]*this.shift.x+this.innerOrigin.x+this.cycleCounter*this.cycleShift.x+this.extraShift.x,
        this.origin.y+this.sequence[this.progress]*this.shift.y+this.innerOrigin.y+this.cycleCounter*this.cycleShift.y+this.extraShift.y,
        this.innerOrigin.width+this.counter*this.shift.width+this.cycleCounter*this.cycleShift.width+this.extraShift.width,
        this.innerOrigin.height+this.counter*this.shift.height+this.cycleCounter*this.cycleShift.height+this.extraShift.height,
        target.x + target.offset.x, target.y + target.offset.y, target.width, target.height);
    }
  }
  
  start(){ //starts the animation
    if (this.started === false){
      this.started = true;
      this.startCallback();
      this.last=Date.now();
      this.running = true;      
    }    
  }

  stop(){ //stops the animation immediatelly
    this.running = false;
    this.reset();
  }

  stopCycle(){
    this.cycleCallback = () =>{
      this.stop();
    }
  }

  pause(){
    this.running = false;
  }
  resume(){
    if (this.started === false){
      this.start();
    }
    else{
      this.nextSprite();
      this.last=Date.now();
      this.running = true;    
    }    
  }

  trigger(){
    this.running ? this.pause() : this.resume();
  }

  show(){
    this.hidden=false;
  }
  hide(){
    this.hidden=true;
  }

  nextSprite(){ //will force the next sprite
    this.progress += 1;
    this.cycleCounter+= Math.floor(this.progress/this.sequence.length);
    if (this.cycleCounter>=this.repeats){
      this.progress = this.lastToDraw; 
      this.finalCallback();
      this.pause();
    }
    else{
     this.progress = this.progress%this.sequence.length;
    }
  }

  reset(){ //resets the animation to initial state
    this.progress = 0;
    this.counter = 0;
    this.cycleCounter = 0;
    this.now = undefined;
    this.last = undefined;
    this.stopCycleVal = false;
    this.origin = new Coords(this.initial.origin.x, this.initial.origin.y, this.initial.origin.width, this.initial.origin.height);
    this.shift = new Coords(this.initial.shift.x, this.initial.shift.y, this.initial.shift.width, this.initial.shift.height);
    this.duration = this.initial.duration;
    this.sequence = [...this.initial.sequence];
    this.innerOrigin = new Coords(this.initial.innerOrigin.x, this.initial.innerOrigin.y, this.initial.innerOrigin.width, this.initial.innerOrigin.height);
    this.cycleShift = new Coords(this.initial.cycleShift.x, this.initial.cycleShift.y, this.initial.cycleShift.width, this.initial.cycleShift.height);
    this.extraShift = new Coords(this.initial.extraShift.x, this.initial.extraShift.y, this.initial.extraShift.width, this.initial.extraShift.height);
    this.startCallback = this.initial.startCallback;
    this.repeats = this.initial.repeats;
    this.lastToDraw = this.initial.lastToDraw;
    this.finalCallback = this.initial.finalCallback;
    this.cycleCallback = this.initial.cycleCallback;
    this.hidden = this.initial.hidden;
    this.started = false;
  }

  change(newAnim, $_start=false){  //changes the whole animation to a new animation (and optionaly starts it)
    this.img = newAnim.img;
    this.origin = newAnim.origin;
    this.shift = newAnim.shift;
    this.duration = newAnim.duration;
    this.sequence = newAnim.sequence;
    this.innerOrigin = (newAnim.innerOrigin === false)?(newCoords(0,0,this.origin.width,this.origin.height)):(newAnim.innerOrigin);
    this.cycleShift = (newAnim.cycleShift === false)?(this.cycleShift = newCoords(0,0,0,0)):(newAnim.cycleShift);
    this.extraShift = (newAnim.extraShift === false)?( newCoords(0,0,0,0)):(newAnim.extraShift);
    this.startCallback = newAnim.startCallback;
    this.repeats = newAnim.repeats;
    this.lastToDraw = newAnim.lastToDraw; 
    this.finalCallback = newAnim.finalCallback;
    this.cycleCallback = newAnim.cycleCallback;
    this.progress = 0; //the actual progress of the sequence: this.sequence[this.progress]
    this.counter = 0; //a counter how often the progress changed overall
    this.cycleCounter = 0; // a counter how often the progress changed during this cycle
    this.msps = this.duration/this.sequence.length || 1; //ms per sprite (ms until "next frame")
    this.now = undefined; //the actual time (init only when animation starts)
    this.last = undefined; //the time when the last frame was drawn (init only when animation starts)
    this.running=false;  //true, if the animation is running
    this.stopCycleVal=false;
    this.hidden = newAnim.hidden;
    this.started = false;
    this.initial = {};
    this.initial.origin = new Coords(newAnim.origin.x, newAnim.origin.y, newAnim.origin.width, newAnim.origin.height);
    this.initial.shift = new Coords(newAnim.shift.x, newAnim.shift.y, newAnim.shift.width, newAnim.shift.height);
    this.initial.duration = newAnim.duration;
    this.initial.sequence = newAnim.sequence;
    this.initial.innerOrigin = new Coords(newAnim.innerOrigin.x, newAnim.innerOrigin.y, newAnim.innerOrigin.width, newAnim.innerOrigin.height);
    this.initial.cycleShift = new Coords(newAnim.cycleShift.x, newAnim.cycleShift.y, newAnim.cycleShift.width, newAnim.cycleShift.height);
    this.initial.extraShift = new Coords(newAnim.extraShift.x, newAnim.extraShift.y, newAnim.extraShift.width, newAnim.extraShift.height);
    this.initial.startCallback = newAnim.startCallback;
    this.initial.repeats = newAnim.repeats;
    this.initial.lastToDraw = newAnim.lastToDraw;
    this.initial.finalCallback = newAnim.finalCallback;
    this.initial.cycleCallback = newAnim.cycleCallback;
    this.initial.hidden = newAnim.hidden;
    if ($_start){
      this.start();
    }
  }

  resetAfterCycle(){ 
      this.cycleCallback = ()=>{
        this.reset();
      }
  }
}