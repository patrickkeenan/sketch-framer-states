

function create_files(file_manager, document_name,target_folder,images_folder,framer_folder,home_folder,states_metadata) {
  make_folder(file_manager, target_folder);
  make_folder(file_manager, framer_folder);
  make_folder(file_manager, images_folder);

  // State data sheet
  var JSON_States = JSON.stringify(states_metadata, nil, 2).replace(/"(\w+)"\s*:/g, '$1:')
  
  var file_path = framer_folder + "/states." + document_name + ".js";
  
  var file_contents = "window.FramerStatesSheet = " + JSON_States +"\n";

  // var JSON_mainLayer = JSON.stringify(mainLayer, nil, 2).replace(/"(\w+)"\s*:/g, '$1:')
  // file_contents += "Framer.Config.mainLayer = " + " new ScrollView("+ JSON_mainLayer +")" +"\n Framer.Config.mainLayer.style.backgroundColor='transparent'\n";

  create_file_from_string(file_path, file_contents, true);

  // Local template files
  var FramerIndexFileContents = "<!DOCTYPE html>\n<html>\n\t<head>\n\t\t<meta charset=\"utf-8\">\n\t\t\n\t\t<meta name=\"apple-mobile-web-app-capable\" content=\"yes\">\n\t\t<meta name=\"apple-mobile-web-app-status-bar-style\" content=\"black\">\n\t\t<meta name=\"format-detection\" content=\"telephone=no\">\n\t\t<meta name=\"viewport\" content=\"width=640,initial-scale=0.5,user-scalable=no\">\n\t\t\n\t\t<style type=\"text/css\" media=\"screen\">\n\t\t\n\t\t* {\n\t\t\tmargin:0;\n\t\t\tpadding:0;\n\t\t\tborder:none;\n\t\t\t-webkit-user-select:none;\n\t\t}\n\n\t\tbody {\n\t\t\tbackground-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAMAAAC6V+0/AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAAZQTFRFMzMzDBMatgEYWQAAABhJREFUeNpiYIADRjhgGNKCw8UfcAAQYACltADJ8fw9RwAAAABJRU5ErkJggg==);\n\t\t\tfont: 28px/1em \"Helvetica\";\n\t\t\tcolor: #FFF;\n\t\t\t-webkit-tap-highlight-color: rgba(0,0,0,0);\n\t\t\t-webkit-perspective: 1000px;\n\t\t}\n\t\t\n\t\t::-webkit-scrollbar {\n\t\t\twidth: 0px;\n\t\t\theight: 0px;\n\t\t}\n\t\t\n\t\t</style>\n\t\t\n\t</head>\n\t<body>\n\t\t<script src=\"framer/framer.js\"></script>{{ views }}\n\t\t<script src=\"app.js\"></script>\n\t\t<script src=\"framer/framer.states.js\"></script>\n\t</body>\n</html>"; 
  create_file_from_string(target_folder + "/index.html",  FramerIndexFileContents.replace("{{ views }}",'\n\t\t<script src="framer/states.' + document_name + '.js"></script>'));

  copy_template_from_plugin(file_manager, home_folder,'framer.js',framer_folder);
  copy_template_from_plugin(file_manager, home_folder,'framer.states.js',framer_folder);
  copy_template_from_plugin(file_manager, home_folder,'app.js',target_folder);

}

function generate_states(artboards,states_metadata) {
  for (var artboardIndex = 0; artboardIndex < [artboards count]; artboardIndex++) {
    var artboard = [artboards objectAtIndex:artboardIndex]
    var artboardName = sanitize_filename([artboard name]);
    var artboardLayers = [artboard layers];

    states_metadata[artboardName] = {};

    for (var layerIndex = [artboardLayers count]-1; layerIndex >= 0 ; layerIndex--) {
      var layer = [artboardLayers objectAtIndex:layerIndex];
      var layerName = sanitize_filename([layer name]);

      states_metadata = process_layer_states(layer, artboardName, 0, states_metadata);
    }

  }
  return states_metadata;
}

function export_layers(images_folder, ASSETS_PAGE_NAME) {
  var assetsPage = findAssetsPage(ASSETS_PAGE_NAME)
  var sublayers = [[assetsPage layers] array]
  for (var sub=0; sub < sublayers.count(); sub++) {
    var sublayer = sublayers.objectAtIndex(sub);
    export_layer(sublayer , images_folder);
  }
}

function export_layer(layer,images_folder) {

  var layerClass = [layer class];
  var layerName = [layer name];

  if (should_ignore_layer(layer)) {
    return;
  }

  if(should_become_view(layer)){
    [layer setIsVisible:true];
    var filename = images_folder + "/" + sanitize_filename(layerName) + ".png",
        rect = [layer rectByAccountingForStyleSize:[[layer absoluteRect] rect]],
        slice = [MSSlice sliceWithRect:rect scale:1];
    
    [doc saveArtboardOrSlice:slice toFile:filename];
  }

  if (layerName.indexOf("@@mask") != -1) {
    var _name = layerName.replace("@@mask", "");
    [layer setHasClippingMask:true];
    [layer setName:_name];
  }
  
}


function make_folder(file_manager, path) {
  [file_manager createDirectoryAtPath:path withIntermediateDirectories:true attributes:nil error:nil]
}

function create_file_from_string(filename,the_string) {
  var path = [@"" stringByAppendingString:filename],
      str = [@"" stringByAppendingString:the_string]

  [str writeToFile:path atomically:false encoding:NSUTF8StringEncoding error:nil];
}

function copy_template_from_plugin(file_manager, home_folder,filename,toFolder){
  var project_framerjs_path = toFolder+'/'+filename;
  var plugin_framerjs_path = home_folder+'/Library/Application Support/com.bohemiancoding.sketch3/Plugins/sketch-framer-states/templates/'+filename;

  if ([file_manager fileExistsAtPath:project_framerjs_path]) {
    log("fm: yes, "+ filename +" already exists");
  }else{
    log("fm: no "+filename+" does not exist");
    if ([file_manager copyItemAtPath:plugin_framerjs_path toPath:project_framerjs_path error:nil]) {
        log("fm: success in copying over "+filename);
    } else {
        log("fm: error in trying to copy "+filename);
    }
  }
}

function check_for_errors(){
  var errors = []
  if (!document_is_saved()) {
    errors.push("— Please save your document to export it.")
  }

  return errors.join("\n")
}
function document_is_saved(){
  return [doc fileURL] != nil
}

function is_group(layer) {
  var isGroup = ([layer class] == 'MSLayerGroup');
  var isArtboard = ([layer class] == 'MSArtboardGroup')
  return isGroup || isArtboard
}

function is_bitmap(layer) {
  return ([layer class] == 'MSBitmapLayer')
}

function is_shape_container(layer) {
  var child = [[layer layers] firstObject];
  return ([[layer layers] count] == 1 && [child class] == "MSShapeGroup" && [[child layers] count] == 1);
}

function shape_type(layer) {
  if (!is_shape_container(layer)) { return; }
  var child = [[layer layers] firstObject];
  var shape = [[child layers] firstObject];
  return [shape class];
}

function should_use_css(layer) {
  var shapeType = shape_type(layer);
  return shapeType == "MSRectangleShape" || shapeType == "MSOvalShape";
}

function should_become_view(layer) {
  var layerName = [layer name]
  return is_group(layer) || layerName.slice(-1) == '+';
}

function should_ignore_layer(layer) {
  var layerName = [layer name]
  return layerName.slice(-1) == '-' || [layer class] == "MSPage";
}

function sanitize_filename(name){
  return name.replace(/(\s|:|\/)/g ,"_").replace(/__/g,"_").replace("*","").replace("+","").replace("&","");
}

function has_art(layer) {
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
    return false;
  } else {
    return true;
  }
}

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

  if (!is_shape_container(layerGroup)) { return { boxShadow: extract_shadow_from(layerGroup) }; }
  if (!should_use_css(layerGroup)) { return {}; }

  var styles = {};
  var cssString = [layerGroup CSSAttributeString];
  var cssLines = cssString.split('\n');

  cssLines.forEach(function(line) {
    var values = line.split(":");
    if (values.length > 1 && line.indexOf('//') == -1 && line.indexOf('/*') == -1) {
      var attr = values[0].replace( /-(\w)/g, function _replace( $1, $2 ) {return $2.toUpperCase();});
      var val = values[1].replace(';','').trim();
      styles[attr] = val;
    }
  });

  if (shape_type(layerGroup) == "MSOvalShape") {
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


function findAssetsPage(ASSETS_PAGE_NAME) {
  var pages = [doc pages];
  for (var p = 0; p < [pages count]; p++) {
    var page = [pages objectAtIndex:p];
    if ([page name] == ASSETS_PAGE_NAME) {
      return page;
    }
  }
  return false;
}

function updateAssetsPage(artboards,ASSETS_PAGE_NAME) {
  
  removeAssetsPage(ASSETS_PAGE_NAME);

  assetsPage = [doc addBlankPage];
  [assetsPage setName:ASSETS_PAGE_NAME];

  var artboardCount = [artboards count]

  var copiedArtboards = [];

  for (var artboardIndex = [artboards count] - 1; artboardIndex >= 0; artboardIndex--) {
    var artboard = [artboards objectAtIndex:artboardIndex];

    var copyOfArtboard = [artboard copy];
    [[copyOfArtboard frame] setX:[[copyOfArtboard frame] x] + 5000];

    assetsPage.addLayer(copyOfArtboard);
    copiedArtboards.push(copyOfArtboard);
  }

  var AssetsOffset = 0;
  for(var artboardIndex = 0; artboardIndex < copiedArtboards.length ; artboardIndex++){
    var copyOfArtboard = copiedArtboards[artboardIndex];
    var copyOfArtboardLayers = [copyOfArtboard layers];
    for (var l = 0; l < [copyOfArtboardLayers count]; l++) {
      var layer = [copyOfArtboardLayers objectAtIndex:l];
      var layerName = [layer name];

      if(!addedLayers[layerName]){
        AssetsOffset = addLayerToAssetsPage(layer, assetsPage, AssetsOffset);
        addedLayers[layerName] = layer;
      }
    }
    [copyOfArtboard removeFromParent];
  }
  

  return assetsPage;
}
function removeAssetsPage(ASSETS_PAGE_NAME) {
  var assetsPage = findAssetsPage(ASSETS_PAGE_NAME)
  if (assetsPage) {
    [doc removePage:assetsPage];
  }
}

function addLayerToAssetsPage(layer, assetsPage, AssetsOffset) {
  if (is_group(layer) && should_become_view(layer)){ // && !should_use_css(layer)) {
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
      var currentName = [current name];
      if(!should_flatten_layer(layer) && is_group(current) && should_become_view(current) && !addedLayers[currentName]){
        [current removeFromParent]
        AssetsOffset = addLayerToAssetsPage(current,assetsPage,AssetsOffset)
        addedLayers[currentName] = current;
      }
    }
  }

  return AssetsOffset;
  
}

function metadata_for(layer) {
  // var frame = [layer frame];
  var gkRect = [GKRect rectWithRect:[layer rectByAccountingForStyleSize:[[layer absoluteRect] rect]]];
  var absRect = [layer absoluteRect];
  var parentPositionRect = [[layer parentGroup] absoluteRect]

  var position = {
    x: [absRect x] - [parentPositionRect x],
    y: [absRect y] - [parentPositionRect y]
  }

  var hasMask = false;

  if (layer.hasClippingMask()) {
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

  return r
}

function process_layer_states(layer, artboardName, depth, states_metadata) {
  depth += 1
  
  // Get layer data
  var layerName = [layer name]
  var layerclass = [layer class]
  var layerNameClean = sanitize_filename(layerName);
  
  if(should_become_view(layer)){
    var layerFrame = metadata_for(layer)
    var layerStyle = [layer style];

    states_metadata[artboardName][layerNameClean] = {}
    var layerState = {}
    
    layerState.frame = layerFrame;
    layerState.frame.opacity = [[layerStyle contextSettings] opacity];
    layerState.frame.rotationZ = -[layer rotation];
    layerState.visible = !![layer isVisible];

    //if(has_art(layer) && !should_use_css(layer)) {
      layerState.image = "images/" + layerNameClean + ".png";
    //}
    
    var superLayer = [layer parentGroup];
    var superLayerClass = [superLayer class];
    if( superLayerClass != 'MSArtboardGroup' && superLayerClass != 'MSPage'){
      layerState['parentGroup'] = sanitize_filename([superLayer name]);
    }

    states_metadata[artboardName][layerNameClean] = layerState;
    
    // Export image if layer has no subgroups
    if (!should_flatten_layer(layer) && is_group(layer)) {
      var childLayers = [layer layers];
      var childLayersCount = [childLayers count]

      for (var childLayerIndex=(childLayersCount - 1); childLayerIndex >= 0; childLayerIndex--) {
        var current = [childLayers objectAtIndex:childLayerIndex];
        if([current hasClippingMask]) {
          var maskParentFrame = layerState.frame;
          var metadataForMask = metadata_for(current);
          
          [layer resizeRoot]
          maskParentFrame.x = metadataForMask.x + maskParentFrame.x;
          maskParentFrame.y = metadataForMask.y + maskParentFrame.y;
          maskParentFrame.width = metadataForMask.width;
          maskParentFrame.height = metadataForMask.height;
          layerState.clip = true;

        }else{
          if(!is_bitmap(current)){
            states_metadata = process_layer_states(current,artboardName,depth+1,states_metadata);  
          }
          
        }
      }
    }
    
  }

  return states_metadata;

}
