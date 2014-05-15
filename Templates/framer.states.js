/*
	FRAMER 3 Layer States tool for SKETCH 3
*/

window.FramerStatesSheet = window.FramerStatesSheet || {};
window.FramerStatesHelper = window.FramerStatesHelper || {stateNames:[]};
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
			
			if (layerName.toLowerCase().indexOf("scroll") != -1) {
				layerType = ScrollLayer
			}
			
			if (layerName.toLowerCase().indexOf("paging") != -1) {
				layerType = ui.PagingLayer
			}

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
			layer.draggable = new ui.Draggable(layer)
		}

	}
	nestLayer = function(layerName, stateName) {
		var layerInSheet = FramerStatesSheet[stateName][layerName]
		var layer = LayersByName[layerName]
		var superLayer
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
	var layersAreSetUp = false;
	
	for (var stateName in FramerStatesSheet) {
		// Load the layers for this document
		if(layersAreSetUp == false){
			for (var layerName in FramerStatesSheet[stateName]) {
				createLayer(layerName,stateName)
			}
			for (var layerName in FramerStatesSheet[stateName]) {
				nestLayer(layerName,stateName)
			}
		}
		layersAreSetUp = true

		for (var layerName in FramerStatesSheet[stateName]) {
			if(LayersByName[layerName]) setupStatesForLayer(layerName,stateName)
		}
		FramerStatesHelper.stateNames.push(stateName)
	}

	FramerStatesHelper.cycle = Framer.Utils.cycle(FramerStatesHelper.stateNames)
	
	return LayersByName

}

FramerStatesHelper.switchInstant =function(stateName){
	if(!stateName){
      for (var state in FramerStatesSheet) {
        stateName = state;break;
      }
    }
    
    for (var layerName in FramerStatesSheet[stateName]) {
      	if(LayersByName[layerName]) LayersByName[layerName].states.switchInstant(stateName);LayersByName[layerName].visible = FramerStatesSheet[stateName][layerName].visible;
    }
}
FramerStatesHelper.switch =function(stateName){
	//console.log('moving',stateName)
	for (var layerName in FramerStatesSheet[stateName]) {
		var layerState = FramerStatesSheet[stateName][layerName]

      	if(layerState){
      		
	      	var aniOptions = {
	      		curve : layerState.curve,
		      	time : layerState.time,
		      	delay : layerState.delay	
	      	}

			if (!aniOptions.curve) aniOptions.curve = Framer.Config.animationCurve;
			if (!aniOptions.time) aniOptions.time = Framer.Config.animationTime;
			if (!aniOptions.delay) aniOptions.delay = Framer.Config.animationDelay;
			
	      	LayersByName[layerName].states.switch(stateName,aniOptions);LayersByName[layerName].visible = layerState.visible;
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

FramerStatesHelper.update(FramerStatesSheet,AppStates)

window.LayersByName = loadLayers()
FramerStatesHelper.switchInstant(FramerStatesHelper.cycle())
if(AppLoad) AppLoad()