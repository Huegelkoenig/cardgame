class Inputs{
  constructor(){
      this.screenPosition = new Point2D() //relative to screen   //TODO: probably not needed => delete all occurances below
      this.absPosition = new Point2D();   //relative to cardgameCanvas rect  TODO: probably not needed => delete all occurances below
      this.position = new Point2D();      //relative to cardgameCanvas.rect cardgameCanvas.scale
      this.mouseDown = false;
      this.touched = false;
      this.touchId = 0;
      this.pressed = false;
      this.pressedAt  = new Point2D();
      this.clicked = [];
      this.dragged = [];
      this.dragOffset = new Point2D(0,0);
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
    //TODO: below just for testing
    console.log('press => x: ',this.position.x, 'y: ', this.position.y, 'cardgameCanvas.scale: ', cardgameCanvas.scale);
    socket.emit('press', this.position.x, this.position.y);
    cardgameCanvas.ctx.beginPath();
    cardgameCanvas.ctx.moveTo(this.position.x, this.position.y);
    //TODO: above just for testing
    
    this.pressedAt.set(this.position.x, this.position.y);
    this.dragOffset.set(0,0);
    for (let z=scene.layers.length-1; z>-1; z--){
      for (const[name, item] of Object.entries(scene.layers[z])){
        if (item.properties.clickable || item.properties.dragable){
          if (this.position.x >= item.target.box.tl.x && this.position.x <= item.target.box.br.x && this.position.y >= item.target.box.tl.y && this.position.y <= item.target.box.br.y){
            if (item.properties.clickable){  //TODO: bubbling?
              this.clicked.push(name);
              console.log(this.clicked); break;
            };
            if (item.properties.dragable){ //TODO: bubbling
              this.dragged.push(name);
              console.log(this.dragged); break;
            };
          }
        }
      }
      if (this.clicked.length>0 || this.dragged.length>0){  //TODO: bubbling?   now, it exits the layers-loop
        break;
      }
    }
  }

  dragHandler(evt){
    //TODO: below just for testing
    console.log('drag');
    cardgameCanvas.ctx.lineTo(this.position.x, this.position.y);
    cardgameCanvas.ctx.stroke();
    //TODO: above just for testing
    this.dragOffset.set(this.position.x - this.pressedAt.x, this.position.y - this.pressedAt.y);
    console.log(this.dragOffset);
    this.dragged.forEach((name)=>{
      scene.items[name].offset = this.dragOffset;
      //console.log(scene.items[name].target.offset);
    });
  }

  releaseHandler(evt){
    //TODO: below just for testing
    console.log('release => x: ', this.position.x, 'y: ', this.position.y, 'cardgameCanvas.scale: ', cardgameCanvas.scale);
    socket.emit('release', this.position.x, this.position.y)
    cardgameCanvas.ctx.stroke();
    //TODO: above just for testing
    this.clicked.forEach((name)=>{
      if (this.position.x >= scene.items[name].target.box.tl.x && this.position.x <= scene.items[name].target.box.br.x && this.position.y >= scene.items[name].target.box.tl.y && this.position.y <= scene.items[name].target.box.br.y){
        scene.items[name].onClick();
      }
    });
    this.dragged.forEach((name)=>{
      scene.items[name].afterDrag();
    })

    this.clicked = [];
    this.dragged = [];
    this.dragOffset.set(0,0);
  }  
}