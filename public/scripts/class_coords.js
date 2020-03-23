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
  .add(summand): adds smmand values to the existing x, y, width and height values
      summand... another coordinates object
      returns the sum
  .changeTo(coords): changes values to given coodinates
      coords... another coordinates object
*/

class Coords extends Object{
  constructor(x, y, width, height){
    super();
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  add(summand){
    this.x += summand.x;
    this.y += summand.y;
    this.width += summand.width;
    this.height += summand.height;
    return this;
  }

  changeTo(coords){
    this.x = coords.x;
    this.y = coords.y;
    this.width = coords.width;
    this.height = coords.height;
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