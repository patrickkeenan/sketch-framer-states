/*
  FRAMER 3 Layer States tool for SKETCH 3
*/

window.FramerStatesSheet = window.FramerStatesSheet || {};
window.FramerStatesHelper = window.FramerStatesHelper || {stateNames:[]};
Framer.Defaults.Layer.backgroundColor = 'transparent';
Framer.Config.animationCurve = 'spring(500,30,0)';
Framer.Config.animationDelay = 0;
Framer.Config.animationTime = 1;

var loadLayers = function() {

	var Layers = []
	var LayersByName = {}

	createLayer = function(layerName,stateName) {
		var layerInSheet = FramerStatesSheet[stateName][layerName]
		
		var layerType, layerFrame
		var layerInfo = {
			clip: false
		}
		
		if (layerInSheet.image) {
			layerType = ImageView
			//layerFrame = layer.image.frame //What is this for??
			layerInfo.image = layerInSheet.image.path
		}
		else {
			layerType = Layer
		}

		layerFrame = layerInSheet.frame

		layerInfo.visible = layerInSheet.visible
		
		if (layerInSheet.maskFrame) {
			layerFrame = layerInSheet.maskFrame
			layerInfo.clip = true
			layerFrame.width = layerInSheet.maskFrame.width
			layerFrame.height = layerInSheet.maskFrame.height
		}
		
		if (layerName.toLowerCase().indexOf("scroll") != -1) {
			layerType = ScrollView
		}
		
		if (layerName.toLowerCase().indexOf("paging") != -1) {
			layerType = ui.PagingView
		}
		
		var layer = new layerType(layerInfo)
		
		layer.frame = layerFrame;
		layer.rotationZ = layerInSheet.frame.rotationZ;
		layer.opacity = layerInSheet.frame.opacity;

		if(layer.style){
			for (var i in layerInSheet.style) {
				layer.style[i] = layerInSheet.style[i]
			}	
		}
		
		layer.name = layerName
		layer.layerInfo = layerInSheet
		
		Layers.push(layer)
		LayersByName[layerName] = layer

		if (layerName.toLowerCase().indexOf("draggable") != -1) {
			layer.draggable.enabled = true;
		}

	}
	nestLayer = function(layerName, stateName) {
		
		var layerInSheet = FramerStatesSheet[stateName][layerName]
		var layer = LayersByName[layerName]
		var superLayer = Framer.Config.mainLayer
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
		
	}


	setupStatesForLayer = function(layerName,stateName){
		var layer = LayersByName[layerName]
		var layerFrameInSheet = FramerStatesSheet[stateName][layerName]['frame']
		
		layer.states.add(stateName,layerFrameInSheet)
	}
		
	// Loop through all the photoshop documents
	//var firstState = FramerStatesSheet['search']
	
	
	for (var stateName in FramerStatesSheet) {
		// Load the layers for this document
		for (var layerName in FramerStatesSheet[stateName]) {
			if(!LayersByName[layerName]){
				createLayer(layerName,stateName)
			}
		}
	}

	for (var stateName in FramerStatesSheet) {
		for (var layerName in FramerStatesSheet[stateName]) {
			setupStatesForLayer(layerName,stateName);
		}
		FramerStatesHelper.stateNames.push(stateName)
	}

	//TODO: This is broken, nesting should be stateful
	for (var layerName in LayersByName) {
		var layer = LayersByName[layerName];
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
    FramerStatesHelper.adjustZforState(stateName);
    
    for (var layerName in LayersByName) {
    	var layer = LayersByName[layerName];
    	console.log('checking: ',layerName,FramerStatesHelper.has_state(layer,stateName))
      	if(FramerStatesHelper.has_state(layer,stateName)){
      		layer.states.switchInstant(stateName);
      		layer.visible = FramerStatesSheet[stateName][layerName].visible;
      		FramerStatesHelper.switchEvents(stateName,layer)
      	}else{
      		layer.visible = false;
      	}
    }
}

FramerStatesHelper.switch =function(stateName){
	FramerStatesHelper.adjustZforState(stateName);
	for (var layerName in LayersByName) {
		var layer = LayersByName[layerName]

      	if(FramerStatesHelper.has_state(layer,stateName)){
      		
      		var layerState = FramerStatesSheet[stateName][layerName]
      		layer.visible = layerState.visible;
      		var aniOptions = {
	      		curve : layerState.curve,
		      	time : layerState.time,
		      	delay : layerState.delay	
	      	}

			if (!aniOptions.curve) aniOptions.curve = Framer.Config.animationCurve;
			if (!aniOptions.time) aniOptions.time = Framer.Config.animationTime;
			if (!aniOptions.delay) aniOptions.delay = Framer.Config.animationDelay;

			layer.states.switch(stateName,aniOptions);
			FramerStatesHelper.switchEvents(stateName,layer)

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
		if(eventsInSheet['load']){
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

FramerStatesHelper.update(FramerStatesSheet,AppStates);

window.LayersByName = loadLayers();
FramerStatesHelper.switchInstant(FramerStatesHelper.cycle());
if(AppLoad) AppLoad();