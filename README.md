# Sketch Framer

![](states-logo.png?raw=true)

A plugin to export artboards from [Sketch.app](http://www.bohemiancoding.com/sketch) into [FramerJS](http://framerjs.com) as animated states.

## Common questions
* Only works in the beta version since it uses the new plugin infrastructure. [Download Sketch Beta here](http://www.bohemiancoding.com/sketch/beta/).
* Make sure you copy **all** the files as specified below.

## Installation
1. Download the repository using [this link](https://github.com/patrickkeenan/sketch-framer-states/archive/master.zip)
2. Go to Sketch and select Plugins > Reveal Plugins Folder
3. Move the unzipped folder into that plugins directory
4. You will now see _sketch-framer-states_ in Sketch's plugin menu

## Example
I just used Noah's example from the framer site. You can open the sketch file in the plugin folder and just run the two commands above and you should have a working Google Now thingy.

## Caveats
* Make sure the layers in your Sketch file are **groups**. If you have stuff inside a group that you want to move around, group those too, like into subgroups. And if you want to move that stuff around, rinse and repeat.
* Make sure you have **artboards** in your file, that's like the whole point after all. You must have at least one artboard, but that's boring, so have at least two.
* The way the script works is it looks at your **first artboard**. So if you are using layers that are not on your first artboard, you need to copy them there. You can just move them outside the artboard but then drag them inside using the layer sidebar, you should then seem them vanish, poof!
* Each layer in on each artboard must be unique to that artboard. Don't go naming sublayers the same name as their parents, their legacy will live on in other artboards.
* Each artboard should contain the same named layers. This allows the script to connect the dots.

## Nice things
There are some things that I got to work that didn't work in the original plugin and I hope to port them back some how:
* Native masks
* artboards (obviously)

## And somethings I'm gonna integrate next (like 70% done)
* Export CSS for shadows
* Export CSS instead of images for view with only shapes and for backgrounds of layers (only rectangles and circles which are basically rectangles with infinitely round corners)
* Make rotation work properly
* States for filters like saturation and blur
* Add animation options based on naming convention (e.g. delay100 time300)

## Then some crazy shit I hope we can do
* Animate between CSS styles (more of a Framer thing)
* Inject polymer components based on naming convention
* Make text elements actually text elements and write in font-face code to pull down the fonts.

## Usage
1. **Export your images**: You don't need to export your images all the time if you're just moving stuff around. Just use ctrl + alt + command + D. 
**Note**: This will make an images directory and fill it with your layers. You may also notice a new page called _Framer Components_. This is a special page, don't make any edits as they'll just be lost with the next export.
2. **Export your states**: This is the core of the plugin. Its gonna look through your artboards for what you've done – x, y, height, width, opacity, rotation(kinda).
**Note**: This will make a framer directory with your _states.SketchFilename.js) file unique to your prototype and a _states helper_ file. It will also make an _app.js_ file for you to edit and an index.html for you to open.
3. **Check it out**: Open up the index.html file and click anywhere.
**Note**: By default this is moving from state to state on any click. You an assign interaction in the typical Framer way, or you can assign events using the States markup provided in the js file.

## Thanks to [Ale Muñoz](https://github.com/bomberstudios)
This plugin was based on the great work of Ale. The export images part of the plugin is a total copy and paste job, and looking at his source was awesome. The stuff below is from the original export plugin and it may or may not apply, I really don't know, but someday I will:

## Special operations
* **Flatten** To have a group flattened so its child groups don't export individually, append `*` to its name. Example: `Card*`. Flattening complex groups will improve performance.
* **Shape/text layers** To export a shape or a text layer as a view, put it in a group, or append `+` to its name. Otherwise they will export as a background image.
* **Ignore** To ignore a layer, append `-` to its name. Example: `Ignored-`
* **Hidden layers** Hidden layers in Sketch will be exported as hidden layers in Framer. To show the layer in framer, try `view.visible = true`
* **Masks** Native masks don't work. Instead of making a native mask, keep the mask rectangle as a regular object, and add "maskframe" to its name. Sketch-Framer will define a mask for a group, if it has a direct child whose name includes "maskframe".

## Configuration
You can customize the exported files (index.html, app.js) by tweaking sketch-framer-config.js. The most common thing you might want to do is import a library file and include it in all your projects.


## Questions?

Let me know [@patrickkeenanme](https://twitter.com/patrickkeenanme) or get in touch with the authors of the original plugin [@bomberstudios](https://twitter.com/bomberstudios) or [@gem_ray](https://twitter.com/gem_ray) on Twitter!
