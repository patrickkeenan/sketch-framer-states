function is_new_layer(layer){
  var newRect = [layer absoluteRect]
  var newSize = [newRect width] + [newRect height]

  for(var i in layerNames){
    var compareLayer = layerNames[i]
    var compareRect = [compareLayer absoluteRect]
    var compareSize = [compareRect width] + [compareRect height]
    
    if(i == [layer name]){
      log('is new not: '+[layer name] + ' '+ i)
      if(compareSize >= newSize){
        log('new: but is smaller')
        return false  
      }else{
        log('new: but is bigger')
        [compareLayer removeFromParent];
        layerNames[i] = layer;
        return true;
      }
    }
  }
  layerNames[[layer name]] = layer;
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
  return name.replace(/(\s|:|\/)/g ,"_").replace(/__/g,"_").replace("*","").replace("+","").replace("&","");
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
  var shadows = [[layer style] shadows];
  if ([shadows count]) {
    var shadow = [shadows firstObject];
    return [shadow offsetX] + 'px ' + 
           [shadow offsetY]+'px ' +
           [shadow blurRadius]+ 'px ' + 
           [shadow spread]+ 'px ' +
           [[shadow color] stringValueWithAlpha:true];
  }
}


function extract_style_from(layerGroup) {

  log('extract_style_from(' + layerGroup + ')')

  var child = [[layerGroup layers] firstObject]];

  // If not shape layer inside, have to manually extract shadow
  if ([[layerGroup layers] count] != 1 || [child className] != "MSShapeGroup" || [[child layers] count] != 1) {
    return {
      boxShadow: extract_shadow_from(layerGroup)
    }
  }

  var shape = [[child layers] firstObject];
  // Only handle rectangles and ovals
  if (!([shape className] == "MSRectangleShape" || [shape className] == "MSOvalShape")) {
    return {};
  }

  var styles = {};
  var cssString = [layerGroup CSSAttributeString];
  var cssLines = cssString.split('\n');

  cssLines.forEach(function(line) {
    var values = line.split(":");
    if (values.length > 1 && line.indexOf('//') == -1 && line.indexOf('/*') == -1) {
      var attr = values[0].replace( /-(\w)/g, function _replace( $1, $2 ) {return $2.toUpperCase();});
      var val = values[1].replace(';','').trim();
      log('style values ' + attr +':' + values[1].replace(';',''));
      styles[attr] = val;
    }
  });

  if ([shape className] == "MSOvalShape") {
    styles.borderRadius = "9999px";
  }

  return styles;
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

function export_layer(layer) {

  var layerClass = [layer class];
  var layerName = [layer name];

  if (should_ignore_layer(layer)) {
    log("Ignoring <" + layerName + "> of type <" + layerClass + "> ");
    return;
  }

  if(should_become_view(layer)){
    log("Processing <" + layerName + "> of type <" + layerClass + "> ");
    // If layer is a group, do:

    [layer setIsVisible:true];

    //var layerRect = [layer rectByAccountingForStyleSize:[[layer absoluteRect] rect]]
    log("Exporting <" + layerName + ">");

    var filename = images_folder + "/" + sanitize_filename(layerName) + ".png";

    var slice = [MSSlice sliceWithRect:[[layer absoluteRect] rect] scale:2];

    if (in_sandbox()) {
      sandboxAccess.accessFilePath_withBlock_persistPermission(target_folder, function(){
        [doc saveArtboardOrSlice:slice toFile:filename];
      }, true)
    } else {
      [doc saveArtboardOrSlice:slice toFile:filename];
    }

  }

  if (layerName.indexOf("@@mask") != -1) {
    var _name = layerName.replace("@@mask", "");
    log("Re-enabling mask " + _name);
    [layer setHasClippingMask:true];
    [layer setName:_name];
  }
  
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

function findAssetsPage() {
  var pages = [doc pages];
  for (var p = 0; p < [pages count]; p++) {
    var page = [pages objectAtIndex:p];
    if ([page name] == ASSETS_PAGE_NAME) {
      return page;
    }
  }
}

function updateAssetsPage(artboards) {
  
  removeAssetsPage();

  assetsPage = [doc addBlankPage];
  [assetsPage setName:ASSETS_PAGE_NAME];

  var artboardCount = [artboards count]

  for (var artboardIndex = [artboards count] - 1; artboardIndex >= 0; artboardIndex--) {
    var artboard = [artboards objectAtIndex:artboardIndex];
    var artboardName = sanitize_filename([artboard name]);

    var copyOfArtboard = [artboard copy];

    assetsPage.addLayer(copyOfArtboard);
    
    var copyOfArtboardLayers = [copyOfArtboard layers];

    for (var l = 0; l < [copyOfArtboardLayers count]; l++) {
      var layer = [copyOfArtboardLayers objectAtIndex:l];
      addLayerToAssetsPage(layer, assetsPage);
    }

    [copyOfArtboard removeFromParent];
  }

  return assetsPage;
}
function removeAssetsPage() {
  var assetsPage = findAssetsPage()
  if (assetsPage) {
    [doc removePage:assetsPage];
  }
}

function addLayerToAssetsPage(layer, assetsPage) {
  if (is_group(layer) && should_become_view(layer) && is_new_layer(layer)!=false) {
    log('found that its new: '+is_new_layer(layer))
    var styles = {};
    assetsPage.addLayer(layer);

    var layerContext = [[layer style] contextSettings];
    [layerContext setOpacity:1];
    [layer setIsVisible:true];
    [layer setRotation:0];

    var rect = [layer absoluteRect];
    var layerFrameHeightWithStyle = [rect height];
    var orginalRect = [GKRect rectWithRect:[[layer absoluteRect] rect]];
    var layerFrameHeight = [orginalRect height];

    //log('height with style '+layerFrameHeightWithStyle)
    
    var label = assetsPage.addLayerOfType("text");
    var layerName = [layer name] || "Undefined layer";
    [label setName:"label for " + layerName];
    [label setStringValue:layerName];
    [label setFontSize:11];
    [label setFontPostscriptName:"Lucida Grande"];

    var fontColor = [[MSColor alloc] init];
    [fontColor setRed:0.45];
    [fontColor setGreen:0.45];
    [fontColor setBlue:0.45];
    [fontColor setAlpha:1];

    [label setTextColor:fontColor];

    [[label frame] setY:AssetsOffset + 24 + (layerFrameHeightWithStyle - layerFrameHeight)];

    layerFrame = [layer frame];
    [layerFrame setX: 0];
    [layerFrame setY:AssetsOffset + 48 + (layerFrameHeightWithStyle - layerFrameHeight)];

    AssetsOffset += layerFrameHeightWithStyle + 56;

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

    for (var sub = ([sublayers count] - 1); sub >= 0; sub--) {
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
    layerNames[layerName] = layer;
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

function process_layer_states(layer, artboardName, depth) {
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
    layerState.frame.rotationZ = -[layer rotation];
    //layerState.frame.visible = [layer isVisible];
    if([layer isVisible] == 0) layerState.visible = false;
    else layerState.visible = true;
    
    layerState.style = extract_style_from(layer);

    // var styles = extract_style_from(layer)
    // for(var attr in styles){
    //   layerState.style[attr] = styles[attr]
    // }

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
          metadataForMask.x += maskParentFrame.x;
          metadataForMask.y += maskParentFrame.y;
          layerState.maskFrame = metadataForMask

        }else{
          if(!is_bitmap(current)){
            log('not a mask'+current+' '+is_bitmap(layer))
            process_layer_states(current,artboardName,depth+1);  
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
