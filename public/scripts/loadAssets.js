
/*
async function loadAssets

description:
  A function for loading a collection of assets like images or sounds to a container
  
Arguments:
    container... the object {} to which the assets should be loaded to
    type... the type of asset, e.g. 'img', 'audio' or 'video'
    files... an array consisting of objects {} with keys
                  name... the name by which the asset is identified in the collection
                  size... an int with the size of the file to load
    $_callback... a function that gets executed every time a promise resolves.
                  Argument given to the callback on resolving loading the i-th asset will be files[i].size

returns: an array of promises
    
example:
Promise.all(loadAssets(graphics, 'img', ArrayOfsrcfiles, doSomething)).then( ...do something after assets have loaded... )
*/


function loadAssets(container, type, files, $_callback=()=>{}){
    let promises = [];
    //for (const [type, list] of Object.entries(srcfiles)) {
    files.forEach((file)=>{
      let asset;
      let promise;
      let folder;
      switch(type) {
        case 'img': case 'image': case 'images':
          folder = '/image/';
          asset = new Image();
          promise =  new Promise((resolve)=>{
            asset.onload = ()=>{
              delete container[name];
              container[file.name] = asset;
              $_callback(file.size);
              resolve();                
            }
          });
        break;
        case 'audio': case 'sound': case 'sounds':
          folder = '/sound/';
          asset = new Audio();
          promise = new Promise((resolve)=>{
            asset.oncanplaythrough = ()=>{
              delete container[name];
              container[file.name] = asset;
              $_callback(file.size);
              resolve();
            }
          });
        break;   
        case 'video': case 'videos':  //TODO: delete if not needed
          folder = '/video/';
          asset = document.createElement("video");
          promise =  new Promise((resolve)=>{
            asset.canplaythrough = ()=>{
              delete container[name];
              container[file.name] = asset;
              $_callback(file.size);
              resolve();
            }
          });
        break;    
        default: console.log('zusätzlich: ' + type); return;//throw Error('Error: class_assets.js: function loadAsset(): type must be "image" or "img", "audio" or "video"'); 
      }
      asset.src = folder + file.name;
      promises.push(promise);
    });
    return promises;
  }