class Inputs{
  constructor(){
      this.screenPosition = new Point2D() //relative to screen   //TODO: probably not needed => delete all occurances below
      this.absPosition = new Point2D();   //relative to cardgameCanvas rectTODO: probably not needed => delete all occurances below
      this.position = new Point2D();      //relative to cardgameCanvas,rect cardgameCanvas.scale
      this.mouseDown = false;
      this.touched = false;
      this.touchId = 0;
      this.pressed = false;
      window.addEventListener("mousedown", (evt)=>{this.mouseDownHandler(evt)});
      window.addEventListener("mousemove", (evt)=>{this.mouseMoveHandler(evt)});
      window.addEventListener("mouseup", (evt)=>{this.mouseUpHandler(evt)});
      window.addEventListener("touchstart",(evt)=>{this.touchStartHandler(evt)});
      window.addEventListener("touchmove", (evt)=>{this.touchMoveHandler(evt)});
      window.addEventListener("touchend", (evt)=>{this.touchEndHandler(evt)});
      window.addEventListener("touchcancel", (evt)=>{this.touchCancelHandler(evt)});

  }

  mouseDownHandler(evt){
    if (!this.pressed && evt.button==0){
        this.mouseDown = true;
        this.pressed = true;
        this.screenPosition.x = evt.x;
        this.screenPosition.y = evt.y;
        this.absPosition.x = evt.x-cardgameCanvas.rect.x;
        this.absPosition.y = evt.y-cardgameCanvas.rect.y;
        this.position.x = (evt.x-cardgameCanvas.rect.x)/cardgameCanvas.scale;
        this.position.y = (evt.y-cardgameCanvas.rect.y)/cardgameCanvas.scale;
        this.pressHandler(evt);
    }
  }

  mouseMoveHandler(evt){  //mouse drag
    if(this.mouseDown){
      this.screenPosition.x = evt.x;
      this.screenPosition.y = evt.y;
      this.absPosition.x = evt.x-cardgameCanvas.rect.x;
      this.absPosition.y = evt.y-cardgameCanvas.rect.y;
      this.position.x = (evt.x-cardgameCanvas.rect.x)/cardgameCanvas.scale;
      this.position.y = (evt.y-cardgameCanvas.rect.y)/cardgameCanvas.scale;
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
      this.absPosition.x = evt.changedTouches[0].pageX-cardgameCanvas.rect.x;
      this.absPosition.y = evt.changedTouches[0].pageY-cardgameCanvas.rect.y;
      this.position.x = (evt.changedTouches[0].pageX-cardgameCanvas.rect.x)/cardgameCanvas.scale;
      this.position.y = (evt.changedTouches[0].pageY-cardgameCanvas.rect.y)/cardgameCanvas.scale;
      this.pressHandler(evt);        
    }
  }

  touchMoveHandler(evt){
    evt.preventDefault();
    if (this.touched && evt.changedTouches[0].identifier == this.touchId){
      this.screenPosition.x = evt.changedTouches[0].pageX;
      this.screenPosition.y = evt.changedTouches[0].pageY;
      this.absPosition.x = evt.changedTouches[0].pageX-cardgameCanvas.rect.x;
      this.absPosition.y = evt.changedTouches[0].pageY-cardgameCanvas.rect.y;
      this.position.x = (evt.changedTouches[0].pageX-cardgameCanvas.rect.x)/cardgameCanvas.scale;
      this.position.y = (evt.changedTouches[0].pageY-cardgameCanvas.rect.y)/cardgameCanvas.scale;
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
    //TODO: just for testing
    console.log('press => x: ',this.position.x, 'y: ', this.position.y, 'cardgameCanvas.scale: ', cardgameCanvas.scale);
    socket.emit('press', this.position.x, this.position.y)
    cardgameCanvas.ctx.beginPath();
    cardgameCanvas.ctx.moveTo(this.position.x, this.position.y);
  }

  dragHandler(evt){
    //TODO: just for testing
    console.log('drag');
    cardgameCanvas.ctx.lineTo(this.position.x, this.position.y);
    cardgameCanvas.ctx.stroke();
  }

  releaseHandler(evt){
    //TODO: just for testing
    console.log('release => x: ', this.position.x, 'y: ', this.position.y, 'cardgameCanvas.scale: ', cardgameCanvas.scale);
    socket.emit('release', this.position.x, this.position.y)
    cardgameCanvas.ctx.stroke();
  }  
}