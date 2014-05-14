/*
	If you remove any variables from this file, the plugin won't work. If the plugin stops working, replace this file with a fresh copy from Github.
*/


/*
	If you have a common library file you'd like to include in your mocks, put a valid URL in FramerLibraryUrl. This will create a copy of the file in the Framer folder of the prototype, also insert a line to index.html to include the script.

	By default this is undefined, so no library will get included.

	Example:
	var FramerLibraryUrl = "http://www.website.com/library.js";
*/

var FramerLibraryUrl;
var show_errors = true;




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


/* Contents of Framer.states.js */
var FramerStatesJSContents = "\/*\n\tFRAMER 3 Layer States tool for SKETCH 3\n*\/\n\nwindow.FramerStatesSheet = window.FramerStatesSheet || {};\nwindow.FramerStatesHelper = window.FramerStatesHelper || {stateNames:[]};\nFramer.Config.animationCurve = 'spring(500,30,0)';\nFramer.Config.animationDelay = 0;\nFramer.Config.animationTime = 1;\n\nvar loadLayers = function() {\n\t\n\tvar Layers = []\n\tvar LayersByName = {}\n\t\n\tcreateLayer = function(layerName,stateName) {\n\t\tvar layerInSheet = FramerStatesSheet[stateName][layerName]\n\t\tvar layerFrame\n\t\tvar layerInfo = {\n\t\t\tvisible: layerInSheet.visible\n\t\t}\n\t\t\n\t\tif (layerInSheet.image) {\n\t\t\tlayerInfo.image = layerInSheet.image.path\n\t\t}\n\n\t\tlayerFrame = layerInSheet.frame\n\n\t\tif (layerInSheet.maskFrame) {\n\t\t\tlayerFrame = layerInSheet.maskFrame\n\t\t\tlayerInfo.clip = true\n\t\t\tlayerFrame.width = layerInSheet.maskFrame.width\n\t\t\tlayerFrame.height = layerInSheet.maskFrame.height\n\t\t}\n\t\t\n\t\tvar layer = new Layer(layerInfo)\n\t\t\n\t\tlayer.frame = layerFrame;\n\t\tlayer.rotationZ = layerInSheet.frame.rotationZ;\n\t\tlayer.opacity = layerInSheet.frame.opacity;\n\t\t\n\t\tif (layerName.toLowerCase().indexOf(\"scroll\") != -1) {\n\t\t\tlayerInfo.scroll = true;\n\t\t}\n\n\t\tif (layerName.toLowerCase().indexOf(\"draggable\") != -1) {\n\t\t\tlayer.draggable.enabled = true;\n\t\t}\n\n\t\tif(layer.style){\n\t\t\tfor (var i in layerInSheet.style) {\n\t\t\t\tlayer.style[i] = layerInSheet.style[i]\n\t\t\t}\t\n\t\t}\n\t\t\n\t\tlayer.name = layerName\n\t\tlayer.layerInfo = layerInSheet\n\t\t\n\t\tLayers.push(layer)\n\t\tLayersByName[layerName] = layer\n\n\t}\n\tnestLayer = function(layerName, stateName) {\n\t\tvar layerInSheet = FramerStatesSheet[stateName][layerName]\n\t\tvar layer = LayersByName[layerName]\n\t\tvar superLayer\n\t\tif(layerInSheet.parentGroup){\n\t\t\tvar superLayer = LayersByName[layerInSheet.parentGroup]\n\t\t\tsuperLayer.addSubLayer(layer)\n\t\t}\n\t\tif (superLayer && superLayer.contentLayer) {\n\t\t\tlayer.superLayer = superLayer.contentLayer\n\t\t} else {\n\t\t\tlayer.superLayer = superLayer;\n\t\t\tlayer.sendToBack();\n\t\t}\n\t}\n\n\n\tsetupStatesForLayer = function(layerName,stateName){\n\t\tvar layer = LayersByName[layerName]\n\t\tvar layerFrameInSheet = FramerStatesSheet[stateName][layerName]['frame']\n\t\t\n\t\tlayer.states.add(stateName,layerFrameInSheet)\n\t}\n\t\t\n\t\/\/ Loop through all the photoshop documents\n\t\/\/var firstState = FramerStatesSheet['search']\n\tvar layersAreSetUp = false;\n\t\n\tfor (var stateName in FramerStatesSheet) {\n\t\t\/\/ Load the layers for this document\n\t\tif(layersAreSetUp == false){\n\t\t\tfor (var layerName in FramerStatesSheet[stateName]) {\n\t\t\t\tcreateLayer(layerName,stateName)\n\t\t\t}\n\t\t\tfor (var layerName in FramerStatesSheet[stateName]) {\n\t\t\t\tnestLayer(layerName,stateName)\n\t\t\t}\n\t\t}\n\t\tlayersAreSetUp = true\n\n\t\tfor (var layerName in FramerStatesSheet[stateName]) {\n\t\t\tif(LayersByName[layerName]) setupStatesForLayer(layerName,stateName)\n\t\t}\n\t\tFramerStatesHelper.stateNames.push(stateName)\n\t}\n\n\tFramerStatesHelper.cycle = Framer.Utils.cycle(FramerStatesHelper.stateNames)\n\t\n\treturn LayersByName\n\n}\n\nFramerStatesHelper.switchInstant =function(stateName){\n\tif(!stateName){\n      for (var state in FramerStatesSheet) {\n        stateName = state;break;\n      }\n    }\n    \n    for (var layerName in FramerStatesSheet[stateName]) {\n      \tif(LayersByName[layerName]) LayersByName[layerName].states.switchInstant(stateName);LayersByName[layerName].visible = FramerStatesSheet[stateName][layerName].visible;\n    }\n}\nFramerStatesHelper.switch =function(stateName){\n\t\/\/console.log('moving',stateName)\n\tfor (var layerName in FramerStatesSheet[stateName]) {\n\t\tvar layerState = FramerStatesSheet[stateName][layerName]\n\n      \tif(layerState){\n      \t\t\n\t      \tvar aniOptions = {\n\t      \t\tcurve : layerState.curve,\n\t\t      \ttime : layerState.time,\n\t\t      \tdelay : layerState.delay\t\n\t      \t}\n\n\t\t\tif (!aniOptions.curve) aniOptions.curve = Framer.Config.animationCurve;\n\t\t\tif (!aniOptions.time) aniOptions.time = Framer.Config.animationTime;\n\t\t\tif (!aniOptions.delay) aniOptions.delay = Framer.Config.animationDelay;\n\t\t\t\n\t      \tLayersByName[layerName].states.switch(stateName,aniOptions);LayersByName[layerName].visible = layerState.visible;\n      \t}\n    }\n}\nFramerStatesHelper.animateToNextState =function(){\n\tFramerStatesHelper.switch(FramerStatesHelper.cycle())\n}\nFramerStatesHelper.switchEvents = function(stateName,layer){\n\tvar eventsInSheet = FramerStatesSheet[stateName][layer.name].events\n\tif(eventsInSheet){\n\t\tfor(var ev in eventsInSheet){\n\t\t\tlayer.on(ev,eventsInSheet[ev])\n\t\t}\t\n\t}\n\t\n}\n\nFramerStatesHelper.update = function(obj) {\n    for (var i=1; i<arguments.length; i++) {\n        for (var prop in arguments[i]) {\n            var val = arguments[i][prop];\n            try{\n\n            \tif (typeof val == \"object\"){\n            \t\tif(!obj[prop]) obj[prop] = {};\n\t                FramerStatesHelper.update(obj[prop], val);\n            \t}\n\t            else{\n\t                obj[prop] = val;\t\n\t            }\n\t        }catch(e){\n\t        \tconsole.error(e)\n\t        }\n            \n        }\n    }\n    return obj;\n}\n\nFramerStatesHelper.update(FramerStatesSheet,AppStates)\n\nwindow.LayersByName = loadLayers()\nFramerStatesHelper.switchInstant(FramerStatesHelper.cycle())\nif(AppLoad) AppLoad()";


/* The default app.js that will be created, and its contents */
/* eg. you could set this to make a blank app.coffee file instead. */
var FramerScriptFileName = "app.js";
var FramerScriptFileContents = "AppLoad = function(e) {\n\tFramer.Config.animationCurve = 'spring(500,30,0)';\n\tFramer.Config.animationDelay = 0;\n\tFramer.Config.animationTime = 1;\n\twindow.onclick =function(e) {\n\t\t//This is a helper that moves you through all states\n\t\tFramerStatesHelper.animateToNextState()\n\t}\n}\n\nAppStates = {\n\t// Here is where you can adjust the finer points\n\t// stateName: {\n\t// \tlayerName: {\n\t// \t\tframe: {\n\t// \t\t\tx: 0,\n\t// \t\t\ty: 0\n\t// \t\t},\n\t// \t\tcurve: 'linear',\n\t// \t\ttime: 100,\n\t// \t\tdelay: 500\n\t//\t\tevents:{\n\t//\t\t\tclick: function(){\n\t//\t\t\t\tconsole.log('Boom!')\n\t//\t\t\t}\n\t//\t\t}\n\t// \t}\n\t// }\n}";




















































