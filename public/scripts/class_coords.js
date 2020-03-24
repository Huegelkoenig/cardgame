/*
contains:
class Coords: a simple class for image coordinates
function newCoords: checks if arguments have the intented format and creates a new Coordinate-object
*/



/*
class Coords

description:
  a simple class for coordinates of images/sprites
  !constructor and method arguments must match the intented format!
  !use function newCoords() to check arguments!

constructor arguments:
  x... integer
  y... integer
  width... integer
  height... integer

methods:
  .changeTo(coords): changes values to given coodinates
      coords... another Coords object
  .add(summand): adds values to the existing x, y, width and height values and stores them in the Coords object
      summand... another Coords object
      returns the sum
  .justAdd(summand): like add, but doesnt change the original values
  .multiply(multiplier): multiplies the corrosponding x values, y values, width values and height values and stores them in the Coords object
      multiplier... another Coords object
      returns the product
  .justMultiply(multiplier): like multiply, but doesnt change the original values
  
*/

class Coords extends Object{
  constructor(x, y, width, height){
    super();
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  changeTo(coords){
    this.x = coords.x;
    this.y = coords.y;
    this.width = coords.width;
    this.height = coords.height;
  }

  add(summand){
    this.x += summand.x;
    this.y += summand.y;
    this.width += summand.width;
    this.height += summand.height;
    return this;
  }

  justAdd(summand){
    let sum = newCoords(this.x,this.y,this.width,this.height);
    sum.add(summand);
    return sum;
  }

  multiply(multiplier){
    this.x *= multiplier.x;
    this.y *= multiplier.y;
    this.width *= multiplier.width;
    this.height *= multiplier.height;
    return this;
  }

  justMultiply(multiplier){
    let product = newCoords(this.x,this.y,this.width,this.height);
    product.multiply(multiplier);
    return product;
  }
}



/*
function newCoords(x,y,width,height)

description:
  checks the arguments and creates new coordinates

arguments:
  x... integer
  y... integer
  width... integer
  height... integer

return:
  if arguments are ok, a new coordinate object will be returned, else an error will be thrown
*/

function newCoords(x, y, width, height){
  if (!Number.isInteger(x) || !Number.isInteger(y) || !Number.isInteger(width) || !Number.isInteger(height)){
      throw Error(`class_coords.js: function newCoords: coordinates must be integer`);
  }
  return new Coords(x, y, width, height);
}

/*
function newCoordsXY(x,y)

description:
  checks just the x and y arguments and creates new coordinates

arguments:
  x... integer
  y... integer

return:
  if x and y arguments are ok, a new coordinate object with undefined width and height will be returned, else an error will be thrown
*/

function newCoordsXY(x, y){
  if (!Number.isInteger(x) || !Number.isInteger(y)){
      throw Error(`class_coords.js: function newCoords: coordinates must be integer`);
  }
  return new Coords(x, y, undefined, undefined);
}