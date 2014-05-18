var FramerLibraryUrl;
var show_errors = true;
var keep_asset_page = true;

/* Don't touch the following. They are auto-generated based on the Library URL. */
var extra_script_line;
var FramerLibraryFileName;

if(FramerLibraryUrl) {
  FramerLibraryFileName = FramerLibraryUrl.replace(/^.*(\\|\/|\:)/, '');
  extra_script_line = "\n\t\t<script src=\"framer/" + FramerLibraryFileName + "\"></script>";
}
/* End of auto-generated block */

/* Contents of index.html */
var FramerIndexFileContents = "<!DOCTYPE html>\n<html>\n\t<head>\n\t\t<meta charset=\"utf-8\">\n\t\t\n\t\t<meta name=\"apple-mobile-web-app-capable\" content=\"yes\">\n\t\t<meta name=\"apple-mobile-web-app-status-bar-style\" content=\"black\">\n\t\t<meta name=\"format-detection\" content=\"telephone=no\">\n\t\t<meta name=\"viewport\" content=\"width=640,initial-scale=0.5,user-scalable=no\">\n\t\t\n\t\t<style type=\"text/css\" media=\"screen\">\n\t\t\n\t\t* {\n\t\t\tmargin:0;\n\t\t\tpadding:0;\n\t\t\tborder:none;\n\t\t\t-webkit-user-select:none;\n\t\t}\n\n\t\tbody {\n\t\t\tbackground-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAMAAAC6V+0/AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAAZQTFRFMzMzDBMatgEYWQAAABhJREFUeNpiYIADRjhgGNKCw8UfcAAQYACltADJ8fw9RwAAAABJRU5ErkJggg==);\n\t\t\tfont: 28px/1em \"Helvetica\";\n\t\t\tcolor: #FFF;\n\t\t\t-webkit-tap-highlight-color: rgba(0,0,0,0);\n\t\t\t-webkit-perspective: 1000px;\n\t\t}\n\t\t\n\t\t::-webkit-scrollbar {\n\t\t\twidth: 0px;\n\t\t\theight: 0px;\n\t\t}\n\t\t\n\t\t</style>\n\t\t\n\t</head>\n\t<body>\n\t\t<script src=\"framer/framer.js\"></script>{{ views }}\n\t\t<script src=\"app.js\"></script>\n\t\t<script src=\"framer/framer.states.js\"></script>" + (extra_script_line || "") + "\n\t</body>\n</html>";

var document_path = [[doc fileURL] path].split([doc displayName])[0],
    document_name = [doc displayName].replace(".sketch",""),
    target_folder = document_path + document_name,
    images_folder = target_folder + "/images",
    framer_folder = target_folder + "/framer",
    home_folder = NSHomeDirectory(),
    file_manager = [NSFileManager defaultManager],
    AssetsOffset = 0,
    states_metadata = {},
    mainLayer = {},
    layerNames ={},
    assetsPage,
    framerjs_url = "https://raw.githubusercontent.com/koenbok/FramerExamples/master/Examples/Animation%20-%20Basics.framer/framer/framer.js",
    ASSETS_PAGE_NAME = "FramerComponents";


function make_folder(path) {
  log('making folder ' + path);
  if (DRY_RUN) {
    log("DRY_RUN, won't make folder " + path)
    return
  }
  [[NSFileManager defaultManager] createDirectoryAtPath:path withIntermediateDirectories:true attributes:null error:null]
}
function make_export_folder(){
  var path = image_folder()
  make_folder(path)
}
function export_folder(){
  var doc_folder = [[doc fileURL] path].replace([doc displayName], ''),
      doc_name = [doc displayName].replace(".sketch","")
  return doc_folder + doc_name + "/"
}
function image_folder(){
  return export_folder() + "images/"
}

function create_file_from_string(filename,the_string) {
  // log("save_file_from_string()")
  if (DRY_RUN) {
    log("DRY_RUN, won't save file " + filename)
    return
  }

  var path = [@"" stringByAppendingString:filename],
      str = [@"" stringByAppendingString:the_string]

  [str writeToFile:path atomically:false encoding:NSUTF8StringEncoding error:null];
}

function copy_template_from_plugin(filename,toFolder){
  var project_framerjs_path = toFolder+'/'+filename;
  var plugin_framerjs_path = home_folder+'/Library/Application Support/com.bohemiancoding.sketch3/Plugins/sketch-framer-states/templates/'+filename;

  log('fm: testing path '+plugin_framerjs_path)
  log('fm: looking for orginal file '+plugin_framerjs_path)
  
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

function create_files() {
  log("create_files");
  make_folder(target_folder);
  make_folder(framer_folder);
  make_folder(images_folder);

  // State data sheet
  var JSON_States = JSON.stringify(states_metadata, null, 2).replace(/"(\w+)"\s*:/g, '$1:')
  
  var file_path = framer_folder + "/states." + document_name + ".js";
  
  var file_contents = "window.FramerStatesSheet = " + JSON_States +"\n";

  var JSON_mainLayer = JSON.stringify(mainLayer, null, 2).replace(/"(\w+)"\s*:/g, '$1:')

  file_contents += "Framer.Config.mainLayer = " + " new ScrollView("+ JSON_mainLayer +")" +"\n Framer.Config.mainLayer.style.backgroundColor='transparent'\n";

  create_file_from_string(file_path, file_contents, true);

  // Local template files
  create_file_from_string(target_folder + "/index.html",  FramerIndexFileContents.replace("{{ views }}",'\n\t\t<script src="framer/states.' + document_name + '.js"></script>'));

  copy_template_from_plugin('framer.js',framer_folder);
  copy_template_from_plugin('framer.states.js',framer_folder);
  copy_template_from_plugin('app.js',target_folder);

}

function generate_states(artboards) {
  for (var artboardIndex = 0; artboardIndex < [artboards count]; artboardIndex++) {
    var artboard = [artboards objectAtIndex:artboardIndex]
    var artboardName = sanitize_filename([artboard name]);
    var artboardLayers = [artboard layers];

    states_metadata[artboardName] = {};

    log('checking artboard ' + artboardName + ' ' + [artboardLayers count]);

    for (var layerIndex = [artboardLayers count]-1; layerIndex >= 0 ; layerIndex--) {
      var layer = [artboardLayers objectAtIndex:layerIndex];
      var layerName = sanitize_filename([layer name]);

      log('checking first layer '+ layerName);

      process_layer_states(layer, artboardName, 0);
    }

  }
}
function check_for_errors(){
  var errors = []
  if (!document_is_saved()) {
    errors.push("— Please save your document to export it.")
  }

  // if ([[doc pages] count] > 1) {
  //   errors.push("— Multiple pages are not yet supported.")
  // }

  return errors.join("\n")
}
function document_is_saved(){
  return [doc fileURL] != null
}
function document_has_artboards(){
  return [[[doc currentPage] artboards] count] > 0
}
function alert(msg){
  [[NSApplication sharedApplication] displayDialog:msg withTitle:"Sketch Framer found some errors"]
  // alternatively, we could do:
  // [doc showMessage:msg]
  // but maybe that's too subtle for an alert :)
}

function export_layers() {
  for (var i in layerNames){
    export_layer(layerNames[i]);
  }
}

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

function is_shape_container(layer) {
  var child = [[layer layers] firstObject];
  return [[layer layers] count] == 1 && [child className] == "MSShapeGroup" && [[child layers] count] == 1);
}

function shape_type(layer) {
  if (!is_shape_container(layer)) { return; }
  var child = [[layer layers] firstObject];
  var shape = [[child layers] firstObject];
  return [shape className];
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
      log('style values ' + attr +':' + values[1].replace(';',''));
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

function export_layer(layer) {

  if (DRY_RUN) {
    log("DRY_RUN, won't export assets")
    return
  }

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
    

    var filename = images_folder + "/" + sanitize_filename(layerName) + ".png";
    log("Exporting <" + layerName + "> to "+filename);

    //var slice = [MSSlice sliceWithRect:[[layer absoluteRect] rect] scale:2];
    var slice = [[MSSliceMaker slicesFromExportableLayer:layer] firstObject]
    //slice.page = [doc currentPage]
    
    var imageData = [MSSliceExporter dataForSlice:slice format:@"png"]
    [imageData writeToFile:filename atomically:false]

    // if (in_sandbox()) {
    //   sandboxAccess.accessFilePath_withBlock_persistPermission(target_folder, function(){
    //     [doc saveArtboardOrSlice:slice toFile:filename];
    //   }, true)
    // } else {
    //   [doc saveArtboardOrSlice:slice toFile:filename];
    // }

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
  if (is_group(layer) && should_become_view(layer) && !should_use_css(layer) && is_new_layer(layer)) {
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
    
    layerState.frame = layerFrame;
    layerState.frame.opacity = [[layerStyle contextSettings] opacity];
    layerState.frame.rotationZ = -[layer rotation];
    layerState.visible = !![layer isVisible];

    if(has_art(layer) && !should_use_css(layer)) {
      layerState.image = "images/" + layerNameClean + ".png";
    }
    
    layerState.style = extract_style_from(layer);

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
          maskParentFrame.x = metadataForMask.x + maskParentFrame.x;
          maskParentFrame.y = metadataForMask.y + maskParentFrame.y;
          maskParentFrame.width = metadataForMask.width;
          maskParentFrame.height = metadataForMask.height;
          layerState.clip = true;

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
