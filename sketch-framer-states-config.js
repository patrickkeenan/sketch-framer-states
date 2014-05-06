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





/* Don't touch the following. They are auto-generated based on the Library URL. */
var extra_script_line;
var FramerLibraryFileName;

if(FramerLibraryUrl) {
	FramerLibraryFileName = FramerLibraryUrl.replace(/^.*(\\|\/|\:)/, '');
	extra_script_line = "\n\t\t<script src=\"framer/" + FramerLibraryFileName + "\"></script>";
}
/* End of auto-generated block */




/* Contents of index.html */
var FramerIndexFileContents = "<!DOCTYPE html>\n<html>\n\t<head>\n\t\t<meta charset=\"utf-8\">\n\t\t\n\t\t<meta name=\"apple-mobile-web-app-capable\" content=\"yes\">\n\t\t<meta name=\"apple-mobile-web-app-status-bar-style\" content=\"black\">\n\t\t<meta name=\"format-detection\" content=\"telephone=no\">\n\t\t<meta name=\"viewport\" content=\"width=640,initial-scale=0.5,user-scalable=no\">\n\t\t\n\t\t<style type=\"text/css\" media=\"screen\">\n\t\t\n\t\t* {\n\t\t\tmargin:0;\n\t\t\tpadding:0;\n\t\t\tborder:none;\n\t\t\t-webkit-user-select:none;\n\t\t}\n\n\t\tbody {\n\t\t\tbackground-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAMAAAC6V+0/AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAAZQTFRFMzMzDBMatgEYWQAAABhJREFUeNpiYIADRjhgGNKCw8UfcAAQYACltADJ8fw9RwAAAABJRU5ErkJggg==);\n\t\t\tfont: 28px/1em \"Helvetica\";\n\t\t\tcolor: #FFF;\n\t\t\t-webkit-tap-highlight-color: rgba(0,0,0,0);\n\t\t\t-webkit-perspective: 1000px;\n\t\t}\n\t\t\n\t\t::-webkit-scrollbar {\n\t\t\twidth: 0px;\n\t\t\theight: 0px;\n\t\t}\n\t\t\n\t\t</style>\n\t\t\n\t</head>\n\t<body>\n\t\t<script src=\"http:\/\/www.framerjs.com/static/js/framer.js\"></script>{{ views }}\n\t\t<script src=\"app.js\"></script>\n\t\t<script src=\"framer/framer.states.js\"></script>" + (extra_script_line || "") + "\n\t</body>\n</html>";


/* Contents of Framer.states.js */
var FramerStatesJSContents = "\/*\n\tFRAMER 2 Export tool for SKETCH 3\n*\/\n\n\nwindow.FramerStatesSheet = window.FramerStatesSheet || {};\nwindow.FramerStatesHelper = window.FramerStatesHelper || {stateNames:[]};\nwindow.Framer.Config = window.Framer.Config || {};\n\nvar loadLayers = function() {\n\t\n\tvar Layers = []\n\tvar LayersByName = {}\n\t\n\tcreateLayer = function(layerName,stateName) {\n\t\tvar layerInSheet = FramerStatesSheet[stateName][layerName]\n\t\t\n\t\tvar layerType, layerFrame\n\t\tvar layerInfo = {\n\t\t\tclip: false\n\t\t}\n\t\t\n\t\tif (layerInSheet.image) {\n\t\t\tlayerType = ImageView\n\t\t\t\/\/layerFrame = layer.image.frame\n\t\t\tlayerInfo.image = layerInSheet.image.path\n\t\t}\n\t\t\n\t\telse {\n\t\t\tlayerType = View\n\t\t}\n\t\tlayerFrame = layerInSheet.frame\n\n\t\tlayerInfo.visible = layerInSheet.visible\n\t\t\n\t\tif (layerInSheet.maskFrame) {\n\t\t\tlayerFrame = layerInSheet.maskFrame\n\t\t\tlayerInfo.clip = true\n\t\t\tlayerFrame.width = layerInSheet.maskFrame.width\n\t\t\tlayerFrame.height = layerInSheet.maskFrame.height\n\t\t\t\n\t\t\tif (layerName.toLowerCase().indexOf(\"scroll\") != -1) {\n\t\t\t\tlayerType = ScrollView\n\t\t\t}\n\t\t\t\n\t\t\tif (layerName.toLowerCase().indexOf(\"paging\") != -1) {\n\t\t\t\tlayerType = ui.PagingView\n\t\t\t}\n\n\t\t}\n\t\t\n\t\tvar layer = new layerType(layerInfo)\n\t\t\n\t\tlayer.frame = layerFrame;\n\t\tlayer.rotationZ = layerInSheet.frame.rotationZ;\n\t\tlayer.opacity = layerInSheet.frame.opacity;\n\n\t\tif(layerInSheet.style){\n\t\t\tfor (var i in layerInSheet.style) {\n\t\t\t\tlayer.style[i] = layerInSheet.style[i]\n\t\t\t}\t\n\t\t}\n\t\t\n\t\tlayer.name = layerName\n\t\tlayer.layerInfo = layerInSheet\n\t\t\n\t\tLayers.push(layer)\n\t\tLayersByName[layerName] = layer\n\n\t\tif (layerName.toLowerCase().indexOf(\"draggable\") != -1) {\n\t\t\tlayer.draggable = new ui.Draggable(layer)\n\t\t}\n\t\t\n\n\t}\n\tnestLayer = function(layerName, stateName) {\n\t\tvar layerInSheet = FramerStatesSheet[stateName][layerName]\n\t\tvar layer = LayersByName[layerName]\n\t\tvar superLayer\n\t\tif(layerInSheet.parentGroup){\n\t\t\tvar superLayer = LayersByName[layerInSheet.parentGroup]\n\t\t\tLayersByName[layerName].superView = superLayer\n\t\t}\n\t\tif (superLayer && superLayer.contentLayer) {\n\t\t\tlayer.superView = superLayer.contentLayer\n\t\t} else {\n\t\t\tlayer.superView = superLayer;\n\t\t\tLayersByName[layerName].sendToBack();\n\t\t}\n\t}\n\n\n\tsetupStatesForLayer = function(layerName,stateName){\n\t\tvar layer = LayersByName[layerName]\n\t\tvar layerFrame = FramerStatesSheet[stateName][layerName]['frame']\n\t\t\n\t\t\/\/ ADDED IN FRAMER 3\n\t\t\/\/layer.states.add(stateName,layerFrame)\n\n\t}\n\t\t\n\tvar layersAreSetUp = false;\n\t\n\tfor (var stateName in FramerStatesSheet) {\n\t\tif(layersAreSetUp == false){\n\t\t\tfor (var layerName in FramerStatesSheet[stateName]) {\n\t\t\t\tcreateLayer(layerName,stateName)\n\t\t\t}\n\t\t\tfor (var layerName in FramerStatesSheet[stateName]) {\n\t\t\t\tnestLayer(layerName,stateName)\n\t\t\t}\n\t\t}\n\t\tlayersAreSetUp = true\n\n\t\tfor (var layerName in FramerStatesSheet[stateName]) {\n\t\t\tif(LayersByName[layerName]) setupStatesForLayer(layerName,stateName)\n\t\t}\n\n\t\tFramerStatesHelper.stateNames.push(stateName)\n\t}\n\n\tFramerStatesHelper.cycle = utils.cycle(FramerStatesHelper.stateNames)\n\n\treturn LayersByName\n\n}\n\nFramerStatesHelper.switchInstant =function(stateName){\n\tif(!stateName){\n      for (var state in FramerStates) {\n        stateName = state;\n        break;\n      }    \n    }\n    for (var layer in FramerStatesSheet[stateName]) {\n      LayersByName[layer].frame = FramerStatesSheet[stateName][layer].frame\n\n      FramerStatesHelper.switchEvents(stateName,LayersByName[layer])\n    }\n}\nFramerStatesHelper.switch =function(stateName){\n\tvar state = FramerStatesSheet[stateName]\n\tfor (var layerName in state) {\n\t\tvar time = state[layerName].time || Framer.Config.animationTime;\n\t\tvar delay = state[layerName].delay || Framer.Config.animationDelay;\n\t\tvar curve = state[layerName].curve || Framer.Config.animationCurve;\n\t\tLayersByName[layerName].ani(state[layerName].frame, time, delay, curve)\n\t}\n}\nFramerStatesHelper.animateToNextState =function(){\n\tFramerStatesHelper.switch(FramerStatesHelper.cycle())\n}\n\nFramerStatesHelper.switchEvents = function(stateName,layer){\n\tvar eventsInState = FramerStatesSheet[stateName][layer.name].events\n\tif(eventsInState){\n\t\tfor(var ev in eventsInState){\n\t\t\tlayer.on(ev,eventsInState[ev])\n\t\t}\t\n\t}\n\t\n}\n\nFramerStatesHelper.update = function(obj) {\n    for (var i=1; i<arguments.length; i++) {\n        for (var prop in arguments[i]) {\n            var val = arguments[i][prop];\n            try{\n\n            \tif (typeof val == \"object\"){\n            \t\tif(!obj[prop]) obj[prop] = {};\n\t                FramerStatesHelper.update(obj[prop], val);\n            \t}\n\t            else{\n\t                obj[prop] = val;\t\n\t            }\n\t        }catch(e){\n\t        \tconsole.error(e)\n\t        }\n            \n        }\n    }\n    return obj;\n}\n\nView.prototype.ani = function (props, time, delay, curve) {\n  if (!curve) curve = Framer.Config.animationCurve;\n  if (!time) time = Framer.Config.animationTime;\n  if (!delay) delay = Framer.Config.animationDelay;\n  var that = this;\n  if (delay > 0) {\n    var a = new Animation({\n      view: this,\n      time: time,\n      curve: curve,\n      properties: props\n    });\n    utils.delay(delay, function () {\n      a.start()\n    })\n  } else {\n    var a = this.animate({\n      time: time,\n      curve: curve,\n      properties: props\n    });\n  }\n  return a;\n};\n\nvar FramerCurves = (FramerCurves) ? FramerCurves : {\n  linear: 'linear',\n  easeIn: 'ease-in',\n  easeOut: 'ease-out',\n  spring: 'spring(350,30,200)'\n};\n\nfor (var i in FramerCurves) View.prototype[i] = function (props, time, delay) {\n    return this.ani(props, time, delay, FramerCurves[i])\n};\n\nFramerStatesHelper.update(FramerStatesSheet,AppStates)\n\nwindow.LayersByName = loadLayers()\nFramerStatesHelper.switchInstant(FramerStatesHelper.cycle())\nif(AppLoad) AppLoad()"


/* The default app.js that will be created, and its contents */
/* eg. you could set this to make a blank app.coffee file instead. */
var FramerScriptFileName = "app.js";
var FramerScriptFileContents = "AppLoad = function(e) {\n\tFramer.Config.animationCurve = 'spring(350,30,200)';\n\tFramer.Config.animationDelay = 0;\n\tFramer.Config.animationTime = 300;\n\twindow.onclick =function(e) {\n\t\t//This is a helper that moves you through all states\n\t\tFramerStatesHelper.animateToNextState()\n\t}\n}\n\nAppStates = {\n\t// Here is where you can adjust the finer points\n\t// stateName: {\n\t// \tlayerName: {\n\t// \t\tframe: {\n\t// \t\t\tx: 0,\n\t// \t\t\ty: 0\n\t// \t\t},\n\t// \t\tcurve: 'linear',\n\t// \t\ttime: 100,\n\t// \t\tdelay: 500\n\t//\t\tevents:{\n\t//\t\t\tclick: function(){\n\t//\t\t\t\tconsole.log('Boom!')\n\t//\t\t\t}\n\t//\t\t}\n\t// \t}\n\t// }\n}";
