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
var keep_asset_page = false;

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
