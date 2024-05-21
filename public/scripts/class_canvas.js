class Canvas{
  constructor(id){
    this.canvas = document.getElementById(id);
    /** @type {CanvasRenderingContext2D} **/
    this.ctx = this.canvas.getContext('2d');    
  }

  //TODO: benötigt?
  get width(){return this.canvas.width};
  set width(w){this.canvas.width = w};
  get height(){return this.canvas.height};
  set height(h){this.canvas.width = h};

  setProperties(properties){
    for (const [key, value] of Object.entries(properties)) {
      this.canvas[key] = value;
    }
  }

  setctxProperties(properties){
    for (const [key, value] of Object.entries(properties)) {
      this.ctx[key] = value;
    }
  }

  setStyles(styles){
    for (const [key, value] of Object.entries(styles)) {
      this.canvas.style[key] = value;
    }
  }

  hide(){
    this.canvas.hidden = true;
  }

  clear(){
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  drawImage(img, position, $_scale=1){
    this.ctx.drawImage(img, position.x, position.y, $_scale*img.width, $_scale*img.height);//TODO:
  }
}



class FullscreenCanvas extends Canvas{
  constructor(id){
    super(id);
  }

  resize(){
    this.setProperties({width:  window.innerWidth,
                        height: window.innerHeight
                       });
  }

  fill($_color=false){
    if ($_color){
      this.setctxProperties({fillStyle: $_color});  
    }
    this.ctx.fillRect(0,0,this.canvas.width, this.canvas.height);
  }
}



// Fixed Aspect Ratio Canvas - as big as possible
class FARCanvas extends Canvas{
  constructor(id){
    super(id);
    this.scale;
    this.rect = this.canvas.getBoundingClientRect();
  }

  resize(){
    if (window.innerWidth/window.innerHeight < this.canvas.width/this.canvas.height){
      //i.e. fullscreen height > canvas.style.height , i.e. bar at top & bottom
      this.scale = window.innerWidth/this.canvas.width;
      const styleHeight = Math.floor(this.scale * this.canvas.height);
      this.setStyles({width : window.innerWidth+'px',
                      height: styleHeight+'px',
                      top   : Math.floor((window.innerHeight - styleHeight)/2) +'px',
                      left  : '0px'
                    });
    }else{
      //i.e. fullscreen width > canvas.style.width , i.e. bar left & reight
      this.scale = window.innerHeight/this.canvas.height;
      const styleWidth = Math.floor(this.scale*this.canvas.width);
      this.setStyles({width : styleWidth+'px',
                      height:  window.innerHeight+'px',
                      top   : '0px',
                      left  : Math.floor((window.innerWidth - styleWidth)/2) +'px'
                    });
    }
    this.rect = this.canvas.getBoundingClientRect();
  }

  //DELETE: ALL BELOW! just for testing
  fill($_color=false){
    if($_color){
      this.setctxProperties({fillStyle: $_color,
                          });
      this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
      return;
    }
    this.setctxProperties({fillStyle:   '#AAAAAA',
                           strokeStyle: 'red',
                           lineWidth:   1
                          });
    this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
    this.setctxProperties({fillStyle: '#FFFFFF'});
    this.ctx.beginPath();
    this.ctx.arc(21, 21, 20, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.arc(this.canvas.width-21, 21, 20, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.arc(21, this.canvas.height-21, 20, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.arc(this.canvas.width-21, this.canvas.height-21, 20, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.stroke();
  }
  /*filltext(username){
    this.setctxProperties({font: "30px Arial"});
    this.ctx.fillText(`hi ${username} w:${fullscreenCanvas.canvas.width} h:${fullscreenCanvas.canvas.height} screen-w:${screen.width} screen-h:${screen.height} dpr:${window.devicePixelRatio} scale:${window.visualViewport.scale}`, 250, 225);
  }*/
  filltext(text, position){
    this.setctxProperties({font: "30px Arial"});
    this.ctx.fillText(text, position.x, position.y);
  }
}
