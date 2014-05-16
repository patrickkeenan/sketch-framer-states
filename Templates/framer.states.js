/*
  FRAMER 3 Layer States tool for SKETCH 3
*/

window.FramerStatesSheet = window.FramerStatesSheet || {};
window.FramerStatesHelper = window.FramerStatesHelper || {stateNames:[]};
Framer.Defaults.Layer.backgroundColor = 'transparent';

var loadLayers = function() {

  var Layers = []
  var LayersByName = {}
  
  createLayer = function(layerName,stateName) {
    console.log('creating layer\t', layerName);

    var layerInSheet = FramerStatesSheet[stateName][layerName]
    var layerFrame
    var layerInfo = {
      visible: layerInSheet.visible
    }
    
    if (layerInSheet.image) {
      layerInfo.image = layerInSheet.image.path
    }

    layerFrame = layerInSheet.frame

    if (layerInSheet.maskFrame) {
      layerFrame = layerInSheet.maskFrame
      layerInfo.clip = true
      layerFrame.width = layerInSheet.maskFrame.width
      layerFrame.height = layerInSheet.maskFrame.height
    }
    
    var layer = new Layer(layerInfo)
    
    layer.frame = layerFrame;
    layer.rotationZ = layerInSheet.frame.rotationZ;
    layer.opacity = layerInSheet.frame.opacity;
    
    if (layerName.toLowerCase().indexOf("scroll") != -1) {
      layerInfo.scroll = true;
    }

    if (layerName.toLowerCase().indexOf("draggable") != -1) {
      layer.draggable.enabled = true;
    }

    if(layer.style){
      for (var i in layerInSheet.style) {
        layer.style[i] = layerInSheet.style[i]
      } 
    }
    
    layer.name = layerName
    layer.layerInfo = layerInSheet
    
    Layers.push(layer)
    LayersByName[layerName] = layer

  }
  nestLayer = function(layerName, stateName) {
    var layerInSheet = FramerStatesSheet[stateName][layerName]
    var layer = LayersByName[layerName]
    var superLayer = FramerStatesHelper.mainView
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
    var layerFrameInSheet = FramerStatesSheet[stateName][layerName]['frame']
    
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
FramerStatesHelper.switchInstant =function(stateName){
  if(!stateName){
      for (var state in FramerStatesSheet) {
        stateName = state;break;
      }
    }

    for (var layerName in LayersByName) {
    	var layer = LayersByName[layerName];
    	console.log('checking: ',layerName,FramerStatesHelper.has_state(layer,stateName))
      	if(FramerStatesHelper.has_state(layer,stateName)){
      		layer.states.switchInstant(stateName);
      		layer.visible = FramerStatesSheet[stateName][layerName].visible;
      	}else{
      		layer.visible = false;
      	}
    }
}
FramerStatesHelper.switch =function(stateName){
	//console.log('moving',stateName)
	for (var layerName in LayersByName) {
		var layer = LayersByName[layerName]

      	if(FramerStatesHelper.has_state(layer,stateName)){
      		
      		var layerState = FramerStatesSheet[stateName][layerName]

      		layer.states.switch(stateName,aniOptions);	
      		layer.visible = layerState.visible;
      		var aniOptions = {
	      		curve : layerState.curve,
		      	time : layerState.time,
		      	delay : layerState.delay	
	      	}

			if (!aniOptions.curve) aniOptions.curve = Framer.Config.animationCurve;
			if (!aniOptions.time) aniOptions.time = Framer.Config.animationTime;
			if (!aniOptions.delay) aniOptions.delay = Framer.Config.animationDelay;

      	}else{
      		layer.visible = false;
      	}
    }
}
FramerStatesHelper.animateToNextState =function(){
  FramerStatesHelper.switch(FramerStatesHelper.cycle())
}
FramerStatesHelper.switchEvents = function(stateName,layer){
  var eventsInSheet = FramerStatesSheet[stateName][layer.name].events
  if(eventsInSheet){
    for(var ev in eventsInSheet){
      layer.on(ev,eventsInSheet[ev])
    } 
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
FramerStatesHelper.mainView = new ScrollView({x:0, y:0, width:360, height:640, scrollVertical:true})

FramerStatesHelper.update(FramerStatesSheet,AppStates)

window.LayersByName = loadLayers()
FramerStatesHelper.switchInstant(FramerStatesHelper.cycle())
if(AppLoad) AppLoad()
