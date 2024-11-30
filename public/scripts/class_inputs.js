class Inputs{
  constructor(){
      this.position = new Point2D(0,0);      //relative to cardgameCanvas.rect cardgameCanvas.scale , initialize at (0,0)
      this.mouseDown = false;
      this.touched = false;
      this.touchId = 0;
      this.pressed = false;
      this.pressedAt  = new Point2D();
      this.dragAlreadyStarted = false;
      this.dragOffset = new Point2D(0,0);
      this.device = 0; //1 for mouse, 2 for touch
  }


  // MOUSE
  mouseMoveHandler(evt){  //mouse drag
    if (!this.touched){
      this.position.x = (evt.x-cardgameCanvas.rect.x)/cardgameCanvas.scale;
      this.position.y = (evt.y-cardgameCanvas.rect.y)/cardgameCanvas.scale;
      this.device = 1;
      this.moveHandler();
    }
  }


  mouseDownHandler(evt){
    if (!this.pressed && evt.button==0){ // if(!this.pressed) same as if(!this.touched), but also immediatelly takes into account when a second (e.g. middle, right) mouse button is clicked
        this.mouseDown = true;
        this.pressed = true;        
        this.position.x = (evt.x-cardgameCanvas.rect.x)/cardgameCanvas.scale;
        this.position.y = (evt.y-cardgameCanvas.rect.y)/cardgameCanvas.scale;
        this.pressedAt.x = this.position.x;
        this.pressedAt.y = this.position.y;
        this.device = 1;
        this.pressHandler(evt);
    }
  }


  mouseUpHandler(evt){
    if (this.mouseDown && evt.button==0){
      this.mouseDown = false;
      this.pressed = false;
      this.device = 1;
      this.releaseHandler(evt);
    }
  }



  // TOUCH
  touchStartHandler(evt){
    evt.preventDefault();
    if (!this.pressed){  //when not already mouseDown and not already touched with another finger
      this.position.x = (evt.changedTouches[0].pageX-cardgameCanvas.rect.x)/cardgameCanvas.scale;
      this.position.y = (evt.changedTouches[0].pageY-cardgameCanvas.rect.y)/cardgameCanvas.scale;
      this.moveHandler(evt);
      this.touched = true;
      this.pressed = true;
      this.touchId = evt.changedTouches[0].identifier;
      this.pressedAt.x = this.position.x;
      this.pressedAt.y = this.position.y;
      this.device = 2;
      this.pressHandler(evt);
    }
  }


  touchMoveHandler(evt){
    evt.preventDefault();
    this.position.x = (evt.changedTouches[0].pageX-cardgameCanvas.rect.x)/cardgameCanvas.scale;
    this.position.y = (evt.changedTouches[0].pageY-cardgameCanvas.rect.y)/cardgameCanvas.scale;
    this.device = 2;
    this.moveHandler();
  }


  touchEndHandler(evt){
    evt.preventDefault();
    if (this.touched && evt.changedTouches[0].identifier == this.touchId){
      this.touched = false;
      this.pressed = false;
      this.device = 2;
      this.releaseHandler(evt);
    }
  }


  touchCancelHandler(evt){
    evt.preventDefault();
    if (this.touched){
      this.touched = false;
      this.pressed = false;
      this.device = 0;
      //TODO: alles rückgängig => speichere Startwerte in this.x_original etc um drags rückgängig zu machen(???)
    }
  }


  // HANDLERS
  moveHandler(evt){
    if (this.pressed){
      this.dragHandler(evt);
      return;
    }
    //first, check for items that arent hovered anymore
    let unhover = [];
    scene.hovered.forEach((name)=>{  //if not hovered anymore...
      if (this.position.x < scene.items[name].target.box.tl.x || this.position.x > scene.items[name].target.box.br.x || this.position.y < scene.items[name].target.box.tl.y || this.position.y > scene.items[name].target.box.br.y){
        unhover.push(name);
      }
    });
    unhover.forEach((name)=>{
      scene.items[name].actions.unhover(); //...run the .unhover() action of these items...
      let idx = scene.hovered.indexOf(name);
      scene.hovered.splice(idx, 1); //.. and delete them from the hovered-list
    });
    //next, check for newly hovered items
    let l=scene.layers.length;
    let hoverStop = false;
    while (l>0 && hoverBubbling){      
      scene.layers[l-1].forEach((name) =>{
        if (scene.items[name].properties.hoverable && !(scene.hovered.length>0 && !scene.items[name].properties.hoverUnder) && this.position.x >= scene.items[name].target.box.tl.x && this.position.x <= scene.items[name].target.box.br.x && this.position.y >= scene.items[name].target.box.tl.y && this.position.y <= scene.items[name].target.box.br.y){
          if (!scene.hovered.includes(name)){ //if this item isn't already marked as hovered...
            scene.hovered.push(name);         //... run the .hover() action
            scene.items[name].actions.hover();
            if (!scene.items[name].properties.hoverThrough){
              bubbling = false;
            }
          }
        };
      });
      l--;
      }
    }


  pressHandler(evt){
    //DELETE: below just for testing
    console.log('press => x: ',this.position.x, 'y: ', this.position.y, 'cardgameCanvas.scale: ', cardgameCanvas.scale);
    socket.emit('press', this.position.x, this.position.y);
    //DELETE: above just for testing
    
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
    if (this.dragAlreadyStarted){
      this.dragOffset.assign(this.position.x - this.pressedAt.x, this.position.y - this.pressedAt.y);
      scene.dragged.forEach((name)=>{
        scene.items[name].offset.assign(this.dragOffset.x, this.dragOffset.y);
        if (!this.dragAlreadyStarted){
          this.dragAlreadyStarted = true;
          scene.items[name].actions.dragStart();
        }
        scene.items[name].actions.onDrag();
      });
      return;
    } //else
    if (Point2D.dist(this.position, this.pressedAt) > 10){
      //TODO: dragstart
      
    } //else{do nothing}
  }


  releaseHandler(evt){
    //DELETE: below just for testing
    console.log('release => x: ', this.position.x, 'y: ', this.position.y, 'cardgameCanvas.scale: ', cardgameCanvas.scale);
    socket.emit('release', this.position.x, this.position.y)
    cardgameCanvas.ctx.stroke();
    //DELETE: above just for testing

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