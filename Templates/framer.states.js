/*
  FRAMER 3 Layer States tool for SKETCH 3
*/

window.FramerStatesSheet = window.FramerStatesSheet || {};
window.FramerStatesHelper = window.FramerStatesHelper || {stateNames:[]};
Framer.Defaults.Layer.backgroundColor = 'transparent';

var loadLayers = function() {

  var Layers = []
  var LayersByName = {}
  
  createLayer = function(layerName, stateName) {
    console.log('creating layer\t', layerName);

    var layerInSheet = FramerStatesSheet[stateName][layerName]
    var layerInfo = {
      name: layerName,
      frame: layerInSheet.frame,
      image: layerInSheet.image && layerInSheet.image.path,
      visible: layerInSheet.visible,
      rotationZ: layerInSheet.frame.rotationZ,
      opacity: layerInSheet.frame.opacity,
      clip: layerInSheet.clip,
    }

    var layer = new Layer(layerInfo)
    
    if (layerName.toLowerCase().indexOf("scroll") != -1) {
      layer.scroll = true;
    }

    if (layerName.toLowerCase().indexOf("draggable") != -1) {
      layer.draggable.enabled = true;
    }

    if (layer.style){
      for (var i in layerInSheet.style) {
        layer.style[i] = layerInSheet.style[i]
      } 
    }
    
    Layers.push(layer)
    LayersByName[layerName] = layer

  }
  nestLayer = function(layerName, stateName) {
    var layerInSheet = FramerStatesSheet[stateName][layerName]
    var layer = LayersByName[layerName]
    var superLayer = Framer.Config.mainLayer;
    if(layerInSheet.parentGroup){
      var superLayer = LayersByName[layerInSheet.parentGroup]
      superLayer.addSubLayer(layer)
    }
    if (superLayer && superLayer.contentLayer) {
      layer.superLayer = superLayer.contentLayer
    } else {
      layer.superLayer = superLayer;
      layer.sendToBack();
    }
    console.log('adding with super',superLayer)
  }


  setupStatesForLayer = function(layerName,stateName){
    console.log('adding state\t', layerName, stateName);

    var layer = LayersByName[layerName]
    var layerFrameInSheet = FramerStatesSheet[stateName][layerName].frame;
    
    layer.states.add(stateName,layerFrameInSheet)
  }
    
  // Loop through all the photoshop documents
  //var firstState = FramerStatesSheet['search']
  
  
  for (var stateName in FramerStatesSheet) {
    // Load the layers for this document
    for (var layerName in FramerStatesSheet[stateName]) {
      if (!LayersByName[layerName]) {
        createLayer(layerName,stateName);
      }
      setupStatesForLayer(layerName,stateName);
    }
    FramerStatesHelper.stateNames.push(stateName);
  }

  //TODO: This is broken, nesting should be stateful
  for (var layerName in LayersByName) {
    var layer = LayersByName[layerName];
    console.log('nesting',layerName,layer.states._orderedStates[1])
    nestLayer(layerName,layer.states._orderedStates[1])
  }

  FramerStatesHelper.cycle = Framer.Utils.cycle(FramerStatesHelper.stateNames)
  
  return LayersByName

}

FramerStatesHelper.has_state = function(layer,stateName){
  return layer.states._states.hasOwnProperty(stateName)
}

FramerStatesHelper.switchInstant = function(stateName) {
  FramerStatesHelper.adjustZforState(stateName);

  for (var layerName in LayersByName) {
    var layer = LayersByName[layerName];
    if (FramerStatesHelper.has_state(layer, stateName)) {
      layer.visible = FramerStatesSheet[stateName][layerName].visible;
      layer.states.switchInstant(stateName);
      FramerStatesHelper.switchEvents(stateName, layer);
    } else {
      layer.visible = false;
    }
  }
}
FramerStatesHelper.switch = function(stateName) {
  FramerStatesHelper.adjustZforState(stateName);

  for (var layerName in LayersByName) {
    var layer = LayersByName[layerName];
    if (FramerStatesHelper.has_state(layer, stateName)) {
      var layerState = FramerStatesSheet[stateName][layerName]

      layer.visible = layerState.visible;

      layer.states.switch(stateName, {
        curve: layerState.curve || Framer.Config.animationCurve,
        time: layerState.time || Framer.Config.animationTime,
        delay: layerState.delay || Framer.Config.animationDelay
      });

      FramerStatesHelper.switchEvents(stateName, layer);

    } else {
      layer.visible = false;
    }
  }
}

FramerStatesHelper.switchToNextState = function() {
  FramerStatesHelper.switch(FramerStatesHelper.cycle())
}

FramerStatesHelper.switchEvents = function(stateName, layer){
  var eventsInSheet = FramerStatesSheet[stateName][layer.name].events;
  if (eventsInSheet) {
    for (var ev in eventsInSheet) {
      layer.on(ev, eventsInSheet[ev])
    }
    if (eventsInSheet['load']) {
      eventsInSheet['load'].call(layer)
    }
  }
}

FramerStatesHelper.adjustZforState =function(stateName){
  for (var layerName in FramerStatesSheet[stateName]) {
    LayersByName[layerName].sendToBack();
  }
}

FramerStatesHelper.update = function(obj) {
    for (var i=1; i<arguments.length; i++) {
        for (var prop in arguments[i]) {
            var val = arguments[i][prop];
            try{

              if (typeof val == "object"){
                if(!obj[prop]) obj[prop] = {};
                  FramerStatesHelper.update(obj[prop], val);
              }
              else{
                  obj[prop] = val;  
              }
          }catch(e){
            console.error(e)
          }
            
        }
    }
    return obj;
}

FramerStatesHelper.update(FramerStatesSheet,AppStates)

window.LayersByName = loadLayers()
FramerStatesHelper.switchInstant(FramerStatesHelper.cycle())
if(AppLoad) AppLoad()
