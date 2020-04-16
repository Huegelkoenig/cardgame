//TODO: add text to fill into squirqle
//TODO: maybe add option to scale around center
//TODO: maybe add option to rotate
//TODO: add shadowBlur, ShadowColor, shadowOffsetX +Y to this

/*
contains:
class Squircle: a simple class for squircles
class squircle_Collection: a class for a collection of squircles (an object with additional methods containing suqircles)
function newSquircle: checks (only required) arguments have the intented format and creates a new squircle
*/



/*
class Squircle

description:
  a simple class for squircles
  !constructor and method arguments must match the intented format!
  !use function newSquircle() to check arguments!

constructor arguments:
  roundX... amount in percent of the rounded part of the horizontal lines (roundX="rounded part in pixels"/width)
  roundY... amount in percent of the rounded part of the vertical lines (roundX="rounded parts in pixels"/width)
            roundX=roundY=100 will create a circle, roundX=0 or roundY=0 will create a rectangle
  $_stroke=true... (optional) if the outline of the squircle shall be stroked
  $_strokeStyle="#000000"... (optional) the color of the stroke 
  $_lineWidth=1... (optional) the width of the stroke
  $_fill=true... (optional) if the squircle shall be filled
  $_fillStyle="#FFFFFF"... (optional) the color of the fill

methods:
  .draw(ctx, target): draws the squircle on a canvas at the targeted coordinates
      ctx... the context of the canvas to draw to, e.g. ctx=canvas.getContext('2d')
      target... a Coords object {x: int, y: int, width: int, height: int} describing the position and size of the rendered squircle on the canvas

example:
let mySquircle = new Squircle(20, 60, true, 'blue', 2, true, 'green');  
//better: let mySquircle = newSquircle(20,60);
mySqircle.draw(ctx,{x:400, y:200, width: 300, height:100});
*/
/*
* @param roundX int
*/
class Squircle{
  constructor(roundX, roundY, $_stroke=false, $_lineWidth=1, $_strokeStyle="#000000", $_fill=false, $_fillStyle="#FFFFFF", $_filltext=false, $_text='', $_font='1px Arial', $_textFillStyle, $_textAlign='center', $_textBaseline='middle'){ 
    this.roundX = roundX;   
    this.roundY = roundY;   
    this.stroke = $_stroke;
    this.lineWidth = $_lineWidth;
    this.strokeStyle = $_strokeStyle;
    this.fill = $_fill;
    this.fillStyle = $_fillStyle;
    this.filltext = $_filltext;
    this.text = $_text;
    this.font = $_font;
    this.textFillStyle = $_textFillStyle;
    this.textAlign = $_textAlign;
    this.textBaseline =$_textBaseline;

  }
/* remains from an old implementation
  get x(){
    return this.cx-this.rx;
  }
  set x(value){
    this.cx = value+this.rx;
  }
  get y(){
    return this.cy-this.ry;
  }
  set y(value){
    this.cy = value+this.ry;
  }
  get width(){
    return 2*this.rx;
  }
  set width(value){
    let v=value/2
    if (v<0){
      throw Error('width must be positive');
    }
    this.rx = v;
  }
  get height(){
    return 2*this.ry;
  }
  set height(value){
    let v=value/2;
    if (v<0){
      throw Error('height must be positive');
    }
    this.ry = v;
  }
*/
  draw(ctx,target){
    //TODO: may rewrite to this.cx, so memory doesnt have to be allocated on every call of draw() ?
    let cx = target.x+target.width/2;  //center x
    let cy = target.y+target.height/2; //center y
    let rx = target.width/2;           //radius x (width in x direction from center)
    let ry = target.height/2;          //radius y (height in y direction from center)
    let lw = rx*(1-this.roundX/100);     //1/2 of the length of the straight line on top and bottom
    let lh = ry*(1-this.roundY/100);     //1/2 of the length of the straight line on left and right
    ctx.beginPath();
    ctx.moveTo(cx-rx, cy+lh);
    ctx.lineTo(cx-rx,cy-lh);
    ctx.ellipse(cx-lw,cy-lh,rx-lw,ry-lh,0,Math.PI,3*Math.PI/2)
    ctx.lineTo(cx+lw,cy-ry);
    ctx.ellipse(cx+lw,cy-lh,rx-lw,ry-lh,0,3*Math.PI/2,0);
    ctx.lineTo(cx+rx,cy+lh);
    ctx.ellipse(cx+lw,cy+lh,rx-lw,ry-lh,0,0,Math.PI/2);
    ctx.lineTo(cx-lw,cy+ry);
    ctx.ellipse(cx-lw,cy+lh,rx-lw,ry-lh,0,Math.PI/2,Math.PI);
    ctx.save();
    if (this.stroke){
      ctx.strokeStyle = this.strokeStyle;
      ctx.lineWidth = this.lineWidth;
      ctx.stroke();
    }
    if (this.fill){
      ctx.fillStyle = this.fillStyle;
      ctx.fill();
    }
    if (this.filltext){
      ctx.font = this.font;
      ctx.fillStyle = this.textFillStyle;
      ctx.textAlign = this.textAlign;
      ctx.textBaseline = this.textBaseline;
      ctx.fillText(this.text, cx, cy);
    }
    ctx.restore();
  }

  render(ctx,target){
    this.draw(ctx,target);
  }
}



/*
class Squircle_Collection

description:
  a simple class for a collection of squircles. Extends the JS-Object with additional methods to append squircles to the collection and draw them
  Squircles are identified in the collection via a given name
  !constructor and method arguments must match the intented format!
  !checks for argument types aren't implemented, yet!

constructor arguments:
  - none - 

methods:
  .append(name, squircle[, $_force=false]): appends a squircle object to the collection
      name... the name by which a squircle is identified in the collection 
      squircle... an object of the Squircle class
      $_force... (optional), if set to true, the method .forceAppend() will be executed. standard is false: if a squircle with the same name already existst in the collection, an Error will be thrown
  .forceAppend(name, squircle):  appends a squircle object to the collection, overwrites existing squircles with the same name
      name... the name by which a squircle is identified in the collection 
      squircle... an object of the Squircle class

example:
let squircles = new Squircle_Collection();
let mySquircle = new Squircle(300,100);
squircles.append('ellipse3-1', mySquircle);
squircles.append('ellipse', anotherSquircle);  //throws an error, bc there's already a squircle called 'ellipse'
squircles.append('ellipse', anotherSquircle, true);  //will overwrite the existing squircle called 'ellipse',  equals .forceAppend(...)
*/

class Squircle_Collection extends Object{
  constructor(){
    super();
  }

  append(name, squircle, $_force=false){
    if ($_force || !this[name]){
      this.forceAppend(name,squircle);
    }
    else{
      throw new Error(`class_squircle.js: Squircle_Collection.append():\nYour Squircle_Collection ${this} has already an element called ${name}.\n${this}.append() was aborted.\n If you want to ignore existing squircles, use\n.append(name,squircle,true) or\n.forceAppend(name,squircle)`);      
    }
  }

  forceAppend(name, squircle){
    delete this[name];
    this[name] = squircle;
  }
}



/*
function newSquircle(roundX,roundY,$_stroke=true, $_strokeStyle="#000000", $_lineWidth=1, $_fill=true, $_fillStyle="#FFFFFF")

description:
  checks (only the required) arguments and creates a new squircle

arguments:
  roundX... must be a number between 0 (included) and 100 (included)
  roundY... must be a number between 0 (included) and 100 (included)
  
return:
  if arguments are ok, a squricle object will be returned, else an error will be thrown
*/

function newSquircle(roundX,roundY,$_stroke=true, $_strokeStyle="#000000", $_lineWidth=1, $_fill=true, $_fillStyle="#FFFFFF"){
  if (!Number.isFinite(roundX) || roundX<0 || roundX>100 || !Number.isFinite(roundY) || roundY<0 || roundY>100){
      throw Error(`class_squircle.js: function newSquircle: roundX and roundY must be between 0 (included) and 100 (included)`);
  }

  return new Squircle(roundX,roundY, $_stroke, $_strokeStyle, $_lineWidth, $_fill, $_fillStyle);
}