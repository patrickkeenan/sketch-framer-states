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

function create_folder(path) {
  log('creating folder ' + path);
  if (in_sandbox()) {
    sandboxAccess.accessFilePath_withBlock_persistPermission(path, function(){
      [file_manager createDirectoryAtPath:path withIntermediateDirectories:true attributes:nil error:nil];
    }, true)
  } else {
    [file_manager createDirectoryAtPath:path withIntermediateDirectories:true attributes:nil error:nil];
  }
}
function is_new_layer(layer){
  var newRect = [layer absoluteRect]
  var newSize = [newRect width] + [newRect height]
  for(var i in layerNames){
    var compareLayer = layerNames[i]
    var compareRect = [compareLayer absoluteRect]
    var compareSize = [compareRect width] + [compareRect height]
    log('is new: '+layer + ' '+ i)
    if(i == [layer name]){
      if(compareSize > newSize){
        return false  
      }else{
        [compareLayer removeFromParent];
        layerNames[i] = layer;
        return true;
      }
      
    }
  }
  return true;
}

function is_group(layer) {
  var isGroup = [layer isMemberOfClass:[MSLayerGroup class]];
  var isArtboard = [layer isMemberOfClass:[MSArtboardGroup class]]
  return isGroup || isArtboard
}

function is_bitmap(layer) {
  return [layer isMemberOfClass:[MSBitmapLayer class]]
}

function should_become_view(layer) {
  var layerName = [layer name]
  return is_group(layer) || layerName.slice(-1) == '+';
}

function should_ignore_layer(layer) {
  var layerName = [layer name]
  log('checking layer name for minus '+layerName)
  return layerName.slice(-1) == '-' || [layer className] == "MSPage";
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
  var layerName = [layer name]
  if(layerName.slice(-1) == "*") {
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
  var styleObjects = [[layer style] shadows]
  log('Checking shadow'+' '+[styleObjects count]+' '+styles+' '+styleObjects)

  var CSSShadow=false;
  
  for(var i=0;i<[styleObjects count];i++){
    var shadowObject =[styleObjects objectAtIndex:i]
    log('Found shadow'+shadowObject)
    var shadowObjectColor = [shadowObject color]
    var shadowColor='rgba('
      +Math.round([shadowObjectColor red]*255)+','
      +Math.round([shadowObjectColor green]*255)+','
      +Math.round([shadowObject blue]*255)+','
      +[shadowObject alpha]+')'
    CSSShadow = [shadowObject offsetX]+'px '+[shadowObject offsetY]+'px '+[shadowObject blurRadius]+'px '+[shadowObject spread]+'px '+shadowColor;
    
    //layer.style().shadows().removeStylePart(shadowObject)
  }
  return CSSShadow;

}


function extract_style_from(shapeLayer) {
  var CSSString = [shapeLayer CSSAttributeString];
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
      if([child class] == 'MSShapeGroup' && layerIndex < 3 && [child isPartOfClippingMask]){
        CSSBoxBackground = child
      }else if([child class] == 'MSShapeGroup' && layerIndex < 2 && ![child hasClippingMask]){
        CSSBoxBackground = child
      }
    }
  }
  return CSSBoxBackground;
}

function major_version() {
  var version = [NSApp applicationVersion]
  return version.substr(0,1);
}

function export_layer(layer) {
  var layerClass = [layer class];
  var layerName = [layer name];
  //var layerRect = [layer rectByAccountingForStyleSize:[[layer absoluteRect] rect]]
  log("Exporting <" + layerName + ">");

  var filename = images_folder + "/" + sanitize_filename(layerName) + ".png";

  var slice = [MSSlice sliceWithRect:[[layer absoluteRect] rect] scale:1];

  if (in_sandbox()) {
    sandboxAccess.accessFilePath_withBlock_persistPermission(target_folder, function(){
      [doc saveArtboardOrSlice:slice toFile:filename];
    }, true)
  } else {
    [doc saveArtboardOrSlice:slice toFile:filename];
  }
  
}

function get_next_id() {
  return ++object_id;
}


function mask_bounds(layer) {
  var sublayers = [layer layers];
  var effective_mask = null;

  for (var sub=0; sub < [sublayers count]; sub++) {
    var current = [sublayers objectAtIndex:sub];
    if(current && [current hasClippingMask]) {
      // If a native mask is detected, rename it and disable it (for now) so we can export its contents
      var _name = [current name] + "@@mask";
      [current setName:_name];
      [current setHasClippingMask:false];
      log("Disabling mask " + [current name]);

      if (!effective_mask) {
        // Only the bottom-most one will be effective
        log("Effective mask " + _name)
        effective_mask = current
      }
    }
  }

  if (effective_mask) {
    return metadata_for(effective_mask);
  } else {
    return null;
  }
}

function calculate_real_position_for(layer) {

  var gkrect = [GKRect rectWithRect:[layer rectByAccountingForStyleSize:[[layer absoluteRect] rect]]],
      absrect = [layer absoluteRect];

  var rulerDeltaX = [absrect rulerX] - [absrect x],
      rulerDeltaY = [absrect rulerY] - [absrect y],
      GKRectRulerX = [gkrect x] + rulerDeltaX,
      GKRectRulerY = [gkrect y] + rulerDeltaY;

  return {
    x: Math.round(GKRectRulerX),
    y: Math.round(GKRectRulerY)
  }
}



function extract_metadata_from(layer) {
  var maskFrame = mask_bounds(layer);
  var layerFrame = metadata_for(layer);
  var layerName = [layer name];
  // call maskframe first so it disables the mask, so we can get correct layerframe

  //metadata.id = get_next_id(); // FIXME

  var metadata = {
    name: sanitize_filename([layer name]),
    layerFrame: layerFrame,
    maskFrame: maskFrame
  };

  if(has_art(layer)) {
    metadata.image = {
      path: "images/" + sanitize_filename([layer name]) + ".png",
      frame: layerFrame
    };
    metadata.imageType = "png";
    // TODO: Find out how the modification hash is calculated in Framer.app
    // metadata.modification = new Date();
  }

  // if it was invisible, mark this in the metadata as well
  if (layerName.indexOf("@@hidden") != -1) {
    metadata.visible = false
  }

  return metadata;
}

function findAssetsPage() {
  assetsPage = false
  var allPages = [doc pages];
  for (var p = 0; p < [allPages count]; p++) {
    var currentPage = [allPages objectAtIndex:p];
    if ([currentPage name] == ASSETS_PAGE_NAME) {
      assetsPage = currentPage;
    }
  }
  return assetsPage;
}

function updateAssetsPage(currentArtboards) {
  assetsPage = findAssetsPage()
  if (assetsPage) {
    [doc removePage:assetsPage];
  }

  assetsPage = [doc addBlankPage];
  [assetsPage setName:ASSETS_PAGE_NAME];

  var artboardCount = [currentArtboards count]

  for (var artboardIndex = artboardCount-1; artboardIndex >= 0; artboardIndex-- ){
    var thisArtboard = [currentArtboards objectAtIndex:artboardIndex]
    var artboardName = sanitize_filename([thisArtboard name]);

    var copyOfArtboard = [thisArtboard copy]

    assetsPage.addLayer(copyOfArtboard)
    
    var copyOfArtboardLayers = [copyOfArtboard layers]

    for(var l=0; l < [copyOfArtboardLayers count]; l++){
      var currentLayer = [copyOfArtboardLayers objectAtIndex:l]
      if(is_new_layer(currentLayer)){
        addLayerToAssetsPage(currentLayer,assetsPage)

      }
    }

    [copyOfArtboard removeFromParent]
    
  }

  return assetsPage;
}

function addLayerToAssetsPage(layer, assetsPage) {
  if (is_group(layer) && should_become_view(layer)) {
    var styles = {}
    assetsPage.addLayer(layer)

    var layerContext = [[layer style] contextSettings] 
    [layerContext setOpacity:1]

    var rect = [layer absoluteRect]
    var layerFrameHeightWithStyle = [rect height]
    var orginalRect = [GKRect rectWithRect:[[layer absoluteRect] rect]]
    var layerFrameHeight = [orginalRect height]

    //log('height with style '+layerFrameHeightWithStyle)
    
    var label = assetsPage.addLayerOfType("text");
    var layerName = [layer name]
    if(!layerName) layerName = 'Undefined layer';
    label.setName("label for "+layerName);
    label.fontSize = 11;
    label.fontPostscriptName = "Lucida Grande"
    var fontColor = [[MSColor alloc] init];
    [fontColor setRed:0.45];
    [fontColor setGreen:0.45];
    [fontColor setBlue:0.45];
    [fontColor setAlpha:1];

    label.textColor = fontColor

    label.setStringValue(layerName)
    labelFrame = [label frame]
    labelFrame.y = AssetsOffset + 30

    layerFrame = [layer frame]
    layerFrame.x = 0
    layerFrame.y = AssetsOffset + 48 + (layerFrameHeightWithStyle-layerFrameHeight)

    AssetsOffset += layerFrameHeightWithStyle + 56

    /* TODO: When using CSS, remove the shadows from images
    var shadowObjects = [[layer style] shadows]
    var shadowObjectsArray = [shadowObjects array]

    for(var i=0;i<[shadowObjectsArray count];i++){
      log('found shadow'+shadowObjects[i])
      var shadowObject = [shadowObjectsArray objectAtIndex:i]
      [shadowObjects removeStylePart:shadowObject]
    }
    */

    
    var sublayers = [layer layers];

    for (var sub=([sublayers count] - 1); sub >= 0; sub--) {
      var current = [sublayers objectAtIndex:sub];
      log('adding '+current)
      if(!should_flatten_layer(layer) && is_group(current) && should_become_view(current)){
        [current removeFromParent]
        addLayerToAssetsPage(current,assetsPage)
      }
      /*
      if(current.hasClippingMask()) {
        [current setHasClippingMask:false]
        var maskParent = current.parentGroup();
        var maskParentFrame = maskParent.frame();
        maskParent.resizeRoot()
        maskParentFrame.x = 0
        AssetsOffset += maskParentFrame.height() - layerFrameHeightWithStyle
        [current setHasClippingMask:true]
      }
      */
    }

    /* TODO: Figure out how to scale up bitmaps on the Components page
    But the question is how do you tell what the native resolution of a bitmap is? writeBitmapImageToFile?
    log('should I export '+layer+' bitmap: '+is_bitmap(layer))
    if(is_bitmap(layer)){
      //export_full_bitmap(page, layer,images_folder + "/" + sanitize_filename(layer.name()) + "-bitmap.png")
    }
    */
    layerNames[layerName] = layer
  }
  
}

function metadata_for(layer) {
  var frame = [layer frame];
  var gkRect = [GKRect rectWithRect:[layer rectByAccountingForStyleSize:[[layer absoluteRect] rect]]];
  var absRect = [layer absoluteRect];
  var parentPositionRect = [[layer parentGroup] absoluteRect]

  var position = {
    x: [absRect x] - [parentPositionRect x],
    y: [absRect y] - [parentPositionRect y]
  }

  var hasMask = false;

  if (layer.hasClippingMask) {
    hasMask = true;
    layer.hasClippingMask = false;
  }

  var r = {
    x: position.x,
    y: position.y,
    width: [gkRect width],
    height: [gkRect height]
  };

  if (hasMask) {
    layer.hasClippingMask = true;
  }

  log(JSON.stringify(r))

  return r
}

function process_layer_states(page, layer, artboardName, depth) {
  depth += 1
  
  // Get layer data
  var layerName = [layer name]
  var layerClassName = [layer className]
  var layerNameClean = sanitize_filename(layerName);

  if(should_ignore_layer(layer)) {
    log_depth("Ignoring <" + layerName + "> of type <" + layerClassName + ">", depth)
    return false;
  }
  
  if(should_become_view(layer)){
    log_depth("Processing <" + layerName + "> of type <" + layerClassName + ">", depth)

    var layerFrame = metadata_for(layer)
    var layerStyle = [layer style];

    states_metadata[artboardName][layerNameClean] = {}
    log('making layer sheet object: '+layerNameClean)
    var layerState = states_metadata[artboardName][layerNameClean]
    
    layerState.frame = layerFrame
    //log("checking frame"+layerNameClean+' '+states_metadata[artboardName][layerNameClean].frame.x)

    if(has_art(layer)) {
      log('layer has art '+layer)
      layerState.image = {
        path: "images/" + layerNameClean + ".png"
        //frame: layerFrame //TODO: Why do we need this?
      };
      layerState.imageType = "png";
      // TODO: Find out how the modification hash is calculated in Framer.app
      // metadata.modification = new Date();
    }
    layerState.frame.opacity = [[layerStyle contextSettings] opacity];
    layerState.frame.rotationZ = [layer rotation];
    
    layerState.style = {}

    var styles = extract_style_from(layer)
    for(var attr in styles){
      layerState.style[attr] = styles[attr]
    }

    // TODO: Make layer names have animation properities
    // if(layerName.indexOf('delay') > -1){
    //   log('Automagic: Delay '+layer.name.match(/delay([0-9]*)/)[1])
    //   child.delay = parseInt(layerName.match(/delay([0-9]*)/)[1])
    //   layerName = layerName.replace(/_?delay([0-9]*)_?/,"")
    // }
    // if(layerName.indexOf('time') > -1){
    //   log('Automagic: Time '+layer.name.match(/time([0-9]*)/)[1])
    //   child.time = parseInt(layerName.match(/time([0-9]*)/)[1])
    //   layerName = layerName.replace(/_?time([0-9]*)_?/,"")
    // }
    // if(layerName.indexOf('spring') > -1){
    //   log('Automagic: spring '+layer.name)
    //   child.curve = 'spring(400,30,200)'
    //   layerName = layerName.replace(/_?spring?/,"")
    // }
    // if(layerName.indexOf('ease-in') > -1){
    //   log('Automagic: ease-in '+layer.name)
    //   child.curve = 'ease-in'
    //   layerName = layerName.replace(/_?ease-in?/,"")
    // }
    // if(layerName.indexOf('ease-out') > -1){
    //   log('Automagic: ease-out '+layer.name)
    //   child.curve = 'ease-out'
    //   layerName = layerName.replace(/_?ease-out?/,"")
    // }
    

    // Export image if layer has no subgroups
    if (!should_flatten_layer(layer) && is_group(layer)) {
      var childLayers = [layer layers];
      var childLayersCount = [childLayers count]

      for (var childLayerIndex=(childLayersCount - 1); childLayerIndex >= 0; childLayerIndex--) {
        var current = [childLayers objectAtIndex:childLayerIndex];
        if([current hasClippingMask]) {
          log('found mask'+current)
          var maskParentFrame = layerState.frame;
          var metadataForMask = metadata_for(current);
          
          [layer resizeRoot]
          //metadataForMask.x = metadataForMask.x - maskParentFrame.x
          //metadataForMask.y = metadataForMask.y - maskParentFrame.y
          layerState.maskFrame = metadataForMask

        }else{
          if(!is_bitmap(current)){
            log('not a mask'+current+' '+is_bitmap(layer))
            process_layer_states(page,current,artboardName,depth+1);  
          }
          
        }
      }
    }

    // Capture hierarchy in export    
    if([layer parentGroup]){
      var parentGroup = [layer parentGroup]
      if(![parentGroup isMemberOfClass:[MSArtboardGroup class]] && ![parentGroup isMemberOfClass:[MSPage class]]){
        layerState.parentGroup = sanitize_filename([parentGroup name])
      }
    }
    
  }

  // TODO: Figure out how to scale up bitmaps on the Components page
  // But the question is how do you tell what the native resolution of a bitmap is? writeBitmapImageToFile?
  // log('should I export '+layer+' bitmap: '+is_bitmap(layer))
  // if(is_bitmap(layer)){
  //   //export_full_bitmap(page, layer,images_folder + "/" + sanitize_filename(layer.name()) + "-bitmap.png")
  // }
  

}

function create_files(page){
  log("create_files("+states_metadata+")")
  var JSON_States = JSON.stringify(states_metadata,null,2)
  JSON_States=JSON_States.replace(/"(\w+)"\s*:/g, '$1:');

  file_path = framer_folder + "/states." + document_name + ".js";
  file_contents = "window.FramerStatesSheet = " + JSON_States +"\n";
  save_file_from_string(file_path,file_contents);

  try {
    // Save JS files from templates:
    save_file_from_string(framer_folder + "/framer.states.js", FramerStatesJSContents);
    //save_file_from_string(framer_folder + "/framer.js", Framer2Source);
    if(![file_manager fileExistsAtPath:(target_folder + "/" + FramerScriptFileName)]) {
      save_file_from_string(target_folder + "/" + FramerScriptFileName, FramerScriptFileContents);
    }
  } catch(e) {
    log(e)
  }

  // Create HTML if it's the first time we're exporting
  log('checking for index.html')
  if(![file_manager fileExistsAtPath:(target_folder + "/index.html")]) {

    save_file_from_string(target_folder + "/index.html",  FramerIndexFileContents.replace("{{ views }}",'\n\t\t<script src="framer/states.' + document_name + '.js"></script>'));
  }

}




















