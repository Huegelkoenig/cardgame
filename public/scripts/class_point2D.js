class Point2D{
  constructor($_x=0, $_y=0){
    this.x = $_x;
    this.y = $_y;
  }

  assign(x, y){
    this.x = x;
    this.y = y;
  }

  static dist(A,B){
    return Math.sqrt((B.x-A.x)*(B.x-A.x) + (B.y-A.y)*(B.y-A.y));
  }

  
}