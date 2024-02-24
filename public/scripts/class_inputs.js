class Inputs{
  constructor(){
      this.screenPosition = new Point2D() //relative to screen   //TODO: probably not needed => delete all occurances below
      this.absPosition = new Point2D();   //relative to cardgameCanvas //TODO: probably not needed => delete all occurances below
      this.position = new Point2D();      //relative to cardgameCanvas, regarding ratio
      this.mouseDown = false;
      this.touched = false;
      this.touchId = 0;
      this.pressed = false;
      document.getElementById('cardgameCanvas').addEventListener("mousedown", (evt)=>{this.mouseDownHandler(evt)});
      document.getElementById("cardgameCanvas").addEventListener("mousemove", (evt)=>{this.mouseMoveHandler(evt)});
      document.getElementById("cardgameCanvas").addEventListener("mouseup", (evt)=>{this.mouseUpHandler(evt)});
      document.getElementById("cardgameCanvas").addEventListener("touchstart",(evt)=>{this.touchStartHandler(evt)});
      document.getElementById("cardgameCanvas").addEventListener("touchmove", (evt)=>{this.touchMoveHandler(evt)});
      document.getElementById("cardgameCanvas").addEventListener("touchend", (evt)=>{this.touchEndHandler(evt)});
      document.getElementById("cardgameCanvas").addEventListener("touchcancel", (evt)=>{this.touchCancelHandler(evt)});

  }

  mouseDownHandler(evt){
    if (!this.pressed && evt.button==0){
        this.mouseDown = true;
        this.pressed = true;
        this.screenPosition.x = evt.x;
        this.screenPosition.y = evt.y;
        this.absPosition.x = evt.x-rect.x;
        this.absPosition.y = evt.y-rect.y;
        this.position.x = (evt.x-rect.x)/ratio;
        this.position.y = (evt.y-rect.y)/ratio;
        this.pressHandler(evt);
    }
  }

  mouseMoveHandler(evt){  //mouse drag
    if(this.mouseDown){
      this.screenPosition.x = evt.x;
      this.screenPosition.y = evt.y;
      this.absPosition.x = evt.x-rect.x;
      this.absPosition.y = evt.y-rect.y;
      this.position.x = (evt.x-rect.x)/ratio;
      this.position.y = (evt.y-rect.y)/ratio;
      this.dragHandler(evt);
    }
  }

  mouseUpHandler(evt){
    if (this.mouseDown && evt.button==0){
      this.mouseDown = false;
      this.pressed = false;
      this.releaseHandler(evt);
    }
  }

  touchStartHandler(evt){
    evt.preventDefault();
    if (!this.pressed){
      this.touched = true;
      this.pressed = true;
      this.touchId = evt.changedTouches[0].identifier;
      console.log(evt);
      this.screenPosition.x = evt.changedTouches[0].pageX;
      this.screenPosition.y = evt.changedTouches[0].pageY;
      this.absPosition.x = evt.changedTouches[0].pageX-rect.x;
      this.absPosition.y = evt.changedTouches[0].pageY-rect.y;
      this.position.x = (evt.changedTouches[0].pageX-rect.x)/ratio;
      this.position.y = (evt.changedTouches[0].pageY-rect.y)/ratio;
      this.pressHandler(evt);        
    }
  }

  touchMoveHandler(evt){
    evt.preventDefault();
    if (this.touched && evt.changedTouches[0].identifier == this.touchId){
      this.screenPosition.x = evt.changedTouches[0].pageX;
      this.screenPosition.y = evt.changedTouches[0].pageY;
      this.absPosition.x = evt.changedTouches[0].pageX-rect.x;
      this.absPosition.y = evt.changedTouches[0].pageY-rect.y;
      this.position.x = (evt.changedTouches[0].pageX-rect.x)/ratio;
      this.position.y = (evt.changedTouches[0].pageY-rect.y)/ratio;
      this.dragHandler(evt);
    }
  }

  touchEndHandler(evt){
    evt.preventDefault();
    if (this.touched && evt.changedTouches[0].identifier == this.touchId){
      this.touched = false;
      this.pressed = false;
      this.releaseHandler(evt);
    }
  }

  touchCancelHandler(evt){
    evt.preventDefault();
    if (this.touched){
      this.touched = false;
      this.pressed = false;
      //TODO: alles rückgängig => speichere Startwerte in this.x_original etc um drags rückgängig zu machen(???)
    }
  }

  pressHandler(evt){
    console.log('press => x: ',this.position.x, 'y: ', this.position.y, 'ratio: ', ratio);
    socket.emit('press', this.position.x, this.position.y)
    ctx.beginPath();
    ctx.moveTo(this.position.x, this.position.y);
  }

  dragHandler(evt){
    console.log('drag');
    ctx.lineTo(this.position.x, this.position.y);
    ctx.stroke();
  }

  releaseHandler(evt){
    console.log('release => x: ', this.position.x, 'y: ', this.position.y, 'ratio: ', ratio);
    socket.emit('release', this.position.x, this.position.y)
    ctx.stroke();
  }  
}

var inputs;