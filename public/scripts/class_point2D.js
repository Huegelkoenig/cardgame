class Point2D{
  constructor(x=0,y=0){
    this.x = x;
    this.y = y;
  }

  set(x,y){
    this.x = x;
    this.y = y;
  }

  static dist(a,b){
    return Math.sqrt((b.x-a.x)*(b.x-a.x) + (b.y-a.y)*(b.y-a.y));
  }

  
}