function save_file_from_string(filename,the_string) {
  var path = [@"" stringByAppendingString:filename],
      str = [@"" stringByAppendingString:the_string];

  if (in_sandbox()) {
    sandboxAccess.accessFilePath_withBlock_persistPermission(filename, function(){
      [str writeToFile:path atomically:true encoding:NSUTF8StringEncoding error:null];
    }, true)
  } else {
    [str writeToFile:path atomically:true encoding:NSUTF8StringEncoding error:null];
  }
}

function make_folder(path){
  if (in_sandbox()) {
    sandboxAccess.accessFilePath_withBlock_persistPermission(path, function(){
      [file_manager createDirectoryAtPath:path withIntermediateDirectories:true attributes:nil error:nil];
    },true)
  } else {
    [file_manager createDirectoryAtPath:path withIntermediateDirectories:true attributes:nil error:nil];
  }
}
function make_folders(){
  // Create folders
  log('creating folders')
  var folders = [target_folder,framer_folder]
  log('creating folders '+folders)
  for (var i = 0; i < folders.length; i++) {
    log('creating folder '+folders[i])
    make_folder(folders[i])
  }
}

function is_group(layer) {
  return [layer isMemberOfClass:[MSLayerGroup class]] || [layer isMemberOfClass:[MSArtboardGroup class]]
}

function is_bitmap(layer) {
  return [layer isMemberOfClass:[MSBitmapLayer class]]
}

function should_become_view(layer) {
  return is_group(layer) || layer.name().slice(-1) == '+';
}

function should_ignore_layer(layer) {
  log('checking layer name for minus '+layer.name())
  var name = layer.name()
  return name.slice(-1) == '-' || [layer className] == "MSPage";
}

function sanitize_filename(name){
  return name.replace(/(\s|:|\/)/g ,"_").replace(/__/g,"_").replace("*","").replace("+","").replace("&","").replace("@@hidden","");
}

function has_art(layer) {
  // return true;
  if(is_group(layer) && !should_flatten_layer(layer)) {
    var has_art = false;
    var sublayers = [layer layers];
    for (var sub=([sublayers count] - 1); sub >= 0; sub--) {
      var sublayer = [sublayers objectAtIndex:sub];
      if(!should_ignore_layer(sublayer) && !should_become_view(sublayer)) {
        has_art = true;
      }
    }
    return has_art;
  } else {
    return true;
  }
}

function should_flatten_layer(layer) {
  var name = layer.name();
  if(name.slice(-1) == "*") {
    return true;
  } else {
    return false;
  }
}

function log_depth(message, depth) {
  var padding = "";
  for(var i=0; i<depth; i++) {
    padding += ">"
  }
  log(padding + " " + message);
}

// Currently unused CSS functions

function extract_shadow_from(layer) {
  //TODO: Get the blur properties
  var styles = {}
  var styleObjects = layer.style().shadows().array()
  log('Checking shadow'+' '+[styleObjects count]+' '+styles+' '+styleObjects)

  var CSSShadow=false;
  
  for(var i=0;i<[styleObjects count];i++){
    var shadowObject =[styleObjects objectAtIndex:i]
    log('Found shadow'+shadowObject)
    
    var shadowColor='rgba('
      +Math.round(shadowObject.color().red()*255)+','
      +Math.round(shadowObject.color().green()*255)+','
      +Math.round(shadowObject.color().blue()*255)+','
      +shadowObject.color().alpha()+')'
    CSSShadow = shadowObject.offsetX()+'px '+shadowObject.offsetY()+'px '+shadowObject.blurRadius()+'px '+shadowObject.spread()+'px '+shadowColor;
    
    //layer.style().shadows().removeStylePart(shadowObject)
  }
  return CSSShadow;

}

function extract_style_from(shapeLayer) {
  /*
  var styles = {}
  var borders = shapeLayer.style().borders().array()

  log('CSS Box:  '+ shapeLayer.CSSAttributeString().toString()+' ')
  for(var borderIndex = 0; borderIndex < borders.length; borderIndex++){
    var border = borders[borderIndex]
    log('CSS Box border is  '+ border)
    styles.borderSize = border.thickness();
    styles.borderColor = 'rgba('
      +Math.round(border.color().red()*255)+','
      +Math.round(border.color().green()*255)+','
      +Math.round(border.color().blue()*255)+','
      +border.color().alpha()+')'
    
    log('CSS Box border position:  '+ border.position())
    log('CSS Box border fillType:  '+ border.fillType())
    log('CSS Box border gradient:  '+ border.gradient())
    log('CSS Box border isEnabled:  '+ border.isEnabled())
    log('CSS Box border red:  '+ border.color().red())
    log('CSS Box border blue:  '+ border.color().blue())
    log('CSS Box border green:  '+ border.color().green())
    log('CSS Box border alpha:  '+ border.color().alpha())
    
  }

  var fills = shapeLayer.style().fills().array()
  log('CSS Box has fills  '+ fills.length)
  for(var fillIndex = 0; fillIndex < fills.length; fillIndex++){
    var fill = fills[fillIndex]
    styles.backgroundColor = 'rgba('
      +Math.round(fill.color().red()*255)+','
      +Math.round(fill.color().green()*255)+','
      +Math.round(fill.color().blue()*255)+','
      +fill.color().alpha()+')'
    log('CSS Box fill is  '+ fill)
    log('CSS Box fill fillType:  '+ fill.fillType())
    log('CSS Box fill red:  '+ fill.color().red())
    log('CSS Box fill blue:  '+ fill.color().blue())
    log('CSS Box fill green:  '+ fill.color().green())
    log('CSS Box fill alpha:  '+ fill.color().alpha())
    log('CSS Box fill gradient:  '+ fill.gradient())
    log('CSS Box fill isEnabled:  '+ fill.isEnabled())
  }
  */

  

  var CSSString = shapeLayer.CSSAttributeString().toString();
  var styles ={}

  var stylestemp = CSSString.split('\n');
  
  for (var i = 0; i < stylestemp.length ; i++) {
    var values = stylestemp[i].split(':');
    if(values.length>1 && stylestemp[i].indexOf('//')==-1 && stylestemp[i].indexOf('/*')==-1){
      var attr = values[0].replace( /-(\w)/g, function _replace( $1, $2 ) {return $2.toUpperCase();});
      var val = values[1].replace(';','').trim();
      log('style values'+attr+':'+values[1].replace(';',''));
      styles[attr] = val;
    }
  } 

  var shadow = extract_shadow_from(shapeLayer)

  if(shadow){
    styles.boxShadow = shadow;
    log('putting shadow into styles attr'+shadow)
  }

  //TODO Make styles if its a rectangle, but get border radius working first
  return {}
  return styles
  //+'\n-webkit-transform: rotateZ('+shapeLayer.rotation()+'deg);'

}

function lookForCSSBoxBackground(layer){
  var layerChildren = [layer children]
  var CSSBoxBackground = false;

  if([layerChildren count] > 0){
    for (var layerIndex =0;layerIndex < [layerChildren count]; layerIndex++){
      var child = [layerChildren objectAtIndex:layerIndex]
      if(child.class() == 'MSShapeGroup' && layerIndex < 3 && child.isPartOfClippingMask()){
        CSSBoxBackground = child
      }else if(child.class() == 'MSShapeGroup' && layerIndex < 2 && !child.hasClippingMask()){
        CSSBoxBackground = child
      }
    }
  }
  return CSSBoxBackground;
}
