//TODO: add description
//TODO: add text to fill into squirqle
//TODO: maybe add option to scale around center
//TODO: maybe add option to rotate
//TODO: dummysave and reset global lineWidth,StrokeStyle,etc values after drawing
//TODO: add shadowBlur, ShadowColor, shadowOffsetX +Y to this
//TODO: checks in function newSquircle()
class Squircle{
  constructor(x, y, width, height, roundX, roundY, $_stroke=true, $_lineWidth=1, $_strokeStyle="#000000", $_fill=true, $_fillStyle="#FFFFFF"){ 
    this.cx = x+width/2;
    this.cy = y+height/2;
    this.rx = width/2;
    this.ry = height/2;
    this.lw = this.rx-roundX;
    this.lh = this.ry-roundY;
    this.stroke = $_stroke;
    this.lineWidth = $_lineWidth;
    this.strokeStyle = $_strokeStyle;
    this.fill = $_fill;
    this.fillStyle = $_fillStyle;
  }

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
  get roundX(){
    return this.rx-this.lw;
  }
  set roundX(value){
    let v=this.rx-value;
    if (v<0){
      throw Error('roundX must be <= width/2. roundX is set to '+value+' but should be <= '+this.width/2)
    }
    this.lw = v;
  }
  get roundY(){
    return this.ry-this.lh;
  }
  set roundY(value){
    let v=this.ry-value;
    if (v<0){
      throw Error('roundY must be <= height/2. roundY is set to '+value+' but should be <= '+this.height/2)
    }
    this.lh = v;
  }

  translate(tx,ty){
    this.cx+=tx;
    this.cy+=ty;
  }

  draw(){
    ctx.lineWidth=this.lineWidth;
    ctx.strokeStyle=this.strokeStyle;
    ctx.fillStyle=this.fillStyle;
    ctx.beginPath();
    ctx.moveTo(this.cx-this.rx, this.cy+this.lh);
    ctx.lineTo(this.cx-this.rx,this.cy-this.lh);
    ctx.ellipse(this.cx-this.lw,this.cy-this.lh,this.rx-this.lw,this.ry-this.lh,0,Math.PI,3*Math.PI/2)
    ctx.lineTo(this.cx+this.lw,this.cy-this.ry);
    ctx.ellipse(this.cx+this.lw,this.cy-this.lh,this.rx-this.lw,this.ry-this.lh,0,3*Math.PI/2,0);
    ctx.lineTo(this.cx+this.rx,this.cy+this.lh);
    ctx.ellipse(this.cx+this.lw,this.cy+this.lh,this.rx-this.lw,this.ry-this.lh,0,0,Math.PI/2);
    ctx.lineTo(this.cx-this.lw,this.cy+this.ry);
    ctx.ellipse(this.cx-this.lw,this.cy+this.lh,this.rx-this.lw,this.ry-this.lh,0,Math.PI/2,Math.PI);
    ctx.stroke();
    ctx.fill();
  }
}


function newSquircle(x,y,width,height,roundX,roundY,$_stroke=true, $_strokeStyle="#000000", $_fill=true, $_fillStyle="#FFFFFF"){
  //TODO: checks

  return new Squircle(x,y,width,height,roundX,roundY,$_stroke, $_strokeStyle, $_fill, $_fillStyle)
}