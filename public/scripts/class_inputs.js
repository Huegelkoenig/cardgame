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
      this.hovered = [];
      this.unhovered = [];
      this.clicked = [];
      this.dragged = [];
      this.dragAlreadyStarted = false;
      this.dragOffset = new Point2D(0,0);
  }


  // MOUSE
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
    this.screenPosition.x = evt.x;
    this.screenPosition.y = evt.y;
    this.absPosition.x = evt.x-cardgameCanvas.rect.x;
    this.absPosition.y = evt.y-cardgameCanvas.rect.y;
    this.position.x = (evt.x-cardgameCanvas.rect.x)/cardgameCanvas.scale;
    this.position.y = (evt.y-cardgameCanvas.rect.y)/cardgameCanvas.scale;
    this.moveHandler();
    if(this.mouseDown){
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



  // TOUCH
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
      this.moveHandler(evt);
      this.pressHandler(evt);        
    }
  }


  touchMoveHandler(evt){
    evt.preventDefault();
    this.screenPosition.x = evt.changedTouches[0].pageX;
    this.screenPosition.y = evt.changedTouches[0].pageY;
    this.absPosition.x = evt.changedTouches[0].pageX-cardgameCanvas.rect.x;
    this.absPosition.y = evt.changedTouches[0].pageY-cardgameCanvas.rect.y;
    this.position.x = (evt.changedTouches[0].pageX-cardgameCanvas.rect.x)/cardgameCanvas.scale;
    this.position.y = (evt.changedTouches[0].pageY-cardgameCanvas.rect.y)/cardgameCanvas.scale;
    if (this.touched && evt.changedTouches[0].identifier == this.touchId){
      this.dragHandler(evt);
      return;
    }
    this.moveHandler();
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


  // HANDLERS
  moveHandler(evt){
    //first, check for items that arent hovered anymore
    this.hovered.forEach((name)=>{  //if not hovered anymore...
      if (this.position.x < scene.items[name].target.box.tl.x || this.position.x > scene.items[name].target.box.br.x || this.position.y < scene.items[name].target.box.tl.y || this.position.y > scene.items[name].target.box.br.y){
        this.unhovered.push(name);
      }
    });
    this.unhovered.forEach((name)=>{
      scene.items[name].actions.unhover(); //...run the .unhover() action of these items...
      let idx = this.hovered.indexOf(name);
      this.hovered.splice(idx, 1); //.. and delete them from the hovered-list
    });
    this.unhovered = [];
    //next, check for newly hovered items
    for (const[name, item] of Object.entries(scene.items)){
      if (this.position.x >= item.target.box.tl.x && this.position.x <= item.target.box.br.x && this.position.y >= item.target.box.tl.y && this.position.y <= item.target.box.br.y){
        if (!this.hovered.includes(name)){ //if this item isn't already marked as hovered...
          this.hovered.push(name);         //... run the .hover() action
          scene.items[name].actions.hover();
        }
      };
    }
  }


  pressHandler(evt){
    //TODO: below just for testing
    console.log('press => x: ',this.position.x, 'y: ', this.position.y, 'cardgameCanvas.scale: ', cardgameCanvas.scale);
    socket.emit('press', this.position.x, this.position.y);
    cardgameCanvas.ctx.beginPath();
    cardgameCanvas.ctx.moveTo(this.position.x, this.position.y);
    //TODO: above just for testing
    
    this.pressedAt.assign(this.position.x, this.position.y);
    this.dragOffset.assign(0,0);
    for (let z=scene.layers.length-1; z>-1; z--){
      scene.layers[z].forEach((name)=>{
        if (scene.items[name].properties.clickable || scene.items[name].properties.dragable){
          if (this.position.x >= scene.items[name].target.box.tl.x && this.position.x <= scene.items[name].target.box.br.x && this.position.y >= scene.items[name].target.box.tl.y && this.position.y <= scene.items[name].target.box.br.y){
            if (scene.items[name].properties.clickable){  //TODO: bubbling?
              this.clicked.push(name);
            };
            if (scene.items[name].properties.dragable){ //TODO: bubbling
              this.dragged.push(name);
            };
          }
        }
    });
    if (this.clicked.length>0 || this.dragged.length>0){  //TODO: bubbling?   atm: it exits the layers-loop
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
    this.dragOffset.assign(this.position.x - this.pressedAt.x, this.position.y - this.pressedAt.y);
    console.log(this.dragOffset);
    this.dragged.forEach((name)=>{
      scene.items[name].offset.assign(this.dragOffset.x, this.dragOffset.y);
      if (!this.dragAlreadyStarted){
        this.dragAlreadyStarted = true;
        scene.items[name].actions.dragStart();
      }
      scene.items[name].actions.onDrag();
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
        scene.items[name].actions.onClick();
      }
    });
    this.dragged.forEach((name)=>{
      this.dragAlreadyStarted = false;
      scene.items[name].actions.dragEnd();
    })

    this.clicked = [];
    this.dragged = [];
    this.dragOffset.assign(0,0);
  }  
}