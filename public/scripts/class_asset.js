/*
contains:
class Asset_Collection: a class for a collection of assets like images or sounds (an object with additional methods containing assets)
function preloadAssets: preload assets
*/



/*
class Asset_Collection

description:
  a simple class for a collection of assets like images, audios and videos.
  Extends the JS-Object with additional methods to preload assets and append them to the collection
  Images are identified in the collection via a given name
  !constructor and method arguments must match the intented format!
  !checks for argument types aren't implemented, yet!

constructor arguments:

methods:
  .append(name, asset[, $_force=false]): appends an asset object to the collection
      name... the name by which the asset is identified in the collection
      img... an asset object (eg a preloaded image)
      $_force... (optional), if set to true, the method .forceAppend() will be executed. standard is false: if a asset with the same name already existst in the collection, an Error will be thrown
  .forceAppend(name, asset):  appends an asset object to the collection, overwrites may existing assets with the same name
      name... the name by which the asset is identified in the collection
      asset... an asset object
  .load(srcfiles): preloads assets and appends them to the collection
      srcfiles... array containing one or multiple arrays of the form [type, name, force, src]
          type... the type of the asset. Must be 'img', 'audio' or 'video'   ('image' or 'sound' also allowed)
          name... the name by which the asset is identified in the collection
          force... true or false. if true, the asset will be forceappended. if false an Error will be thrown if an asset with the same name already exists in the collection
          src... a string  containing the src of the asset
      ...continue with: collection.load(srcfiles).then( ...do something after assets have loaded, eg load more assets or start gameloop... )
          
    
example:
let myImages = new Asset_Collection();
myImages.load([['img', 'blackbutton', true, '/images/blackButton.png'],
               ['img', 'greenbutton', true, '/images/greenButton.jpg']]).then( do something );
myImages.append('blackbutton', preloadedimg); //throws an error, bc there's already an asset called 'blackbutton'
myImages.append('blackbutton', preloadedImg, true);  //will overwrite the existing asset called 'blackbutton',  equals .forceAppend(...)
*/

class Asset_Collection extends Object{
  constructor(){
    super();
  }

  append(name, asset, $_force=false){
    if ($_force || !this[name]){
      this.forceAppend(name,asset);
    }
    else{
      throw new Error(`class_Image.js: Asset_Collection.append():\nYour Asset_Collection ${this} has already an element called ${name}.\n${this}.append() was aborted.\n If you want to ignore existing assets, use\n.append(name,img,true) or\n.forceAppend(name,img)`);      
    }
  }

  forceAppend(name, asset){
    delete this[name];
    this[name] = asset;
  }

  load(srcfiles){
    return Promise.all(srcfiles.map(async (entry)=>{
      let promise = await loadAsset(entry[0],entry[3]); //TODO: await loadAsset(...).then(()=>{ ...customevent sends filesize for loadingbar... ; return asset})
      this.append(entry[1], promise, entry[2]);
      }));
               //name                      type     src        force 
  }
}

/*
function loadAsset(src)

description:
  preloads an asset (image, audio or video)

arguments:
  type... the type of the asset. Must be 'img', 'audio' or 'video'
  src... a string of the filename of the asset to preload (eg. 'http://website.com/asset.png')

return:
  will return a promise, which resolves to the asset

example:
  let myImage;
  async function test(){
    myImage = await loadAsset('img', 'picture.png');
  }
  test().then(document.getElementById('target_asset') = myImage;);
*/

function loadAsset(type, src){
  let asset;
  let promise
  switch(type) {
    case 'image':
    case 'img':
      asset = new Image();
      promise =  new Promise(resolve=>{
        asset.onload = ()=>{
          resolve(asset);
        }
      });
    break;
    case 'sound':
    case 'audio':
      asset = new Audio();
      promise = new Promise(resolve=>{
        asset.oncanplaythrough = ()=>{
          resolve(asset);
        }
      });
    break;   
    case 'video':
      console.log('video ' + src + ' loading :');
      asset = document.createElement("video");
      promise =  new Promise(resolve=>{
        asset.canplaythrough = ()=>{
          console.log('video ' + src + ' loading :');
          resolve(asset);
        }
      });
      break;    
    default: throw Error('Error: class_assets.js: function loadAsset(): type must be "img", "audio" or "video"');
  }  //end switch
  asset.src=src;
  return promise;
}