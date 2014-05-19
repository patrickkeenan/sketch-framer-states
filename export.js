var addedLayers ={};

(function(){
  // Some sanity checks, before we begin:
  var error = check_for_errors()

  if(error) { // Stop execution and display error
    alert("Make sure to fix these before we can continue:\n\n" + error)
  } else { // Let's go
    
    var KEEP_COMPONENTS_PAGE = true,
        ASSETS_PAGE_NAME = "FramerComponents",
        document_path = [[doc fileURL] path].split([doc displayName])[0],
        document_name = [doc displayName].replace(".sketch",""),
        target_folder = document_path + document_name,
        images_folder = target_folder + "/images",
        framer_folder = target_folder + "/framer",
        home_folder = NSHomeDirectory(),
        file_manager = [NSFileManager defaultManager],
        states_metadata = {},
        page = [doc currentPage],
        artboards = [page artboards]
        // mainLayer = {}

    if (![artboards count]) {
      [doc showMessage: "Sketch Framer: You must have multiple artboards for this to work"];
      return;
    }else{
      // TODO: disable dropshadow and replace with CSS
      // TODO: Make scroll view work
      // TODO: Consider a main layer for iPhone frame and such
      // TODO: When using CSS, remove the shadows from images
      // TODO: Figure out how to scale up bitmaps on the Components page
      // TODO: Use CSS for primitive states

      // Setup
      updateAssetsPage(artboards, ASSETS_PAGE_NAME);

      var assetsPage = findAssetsPage(ASSETS_PAGE_NAME)
      if(assetsPage){
        var assetLayers = [[assetsPage layers] array];
        for (var layerIndex = [assetLayers count]-1; layerIndex >= 0 ; layerIndex--) {
          var assetLayer = assetLayers.objectAtIndex(layerIndex);
          log('exporting page'+' '+layerIndex+' '+assetLayer);

        }
      }

      states_metadata = generate_states(artboards,states_metadata);
      
      new AppSandbox().authorize(home_folder, function(){
        create_files(file_manager, document_name,target_folder,images_folder,framer_folder,home_folder,states_metadata);
        export_layers(images_folder, ASSETS_PAGE_NAME);

        if(!KEEP_COMPONENTS_PAGE) removeAssetsPage(ASSETS_PAGE_NAME);

        views = nil;
        ViewsMetadata = nil;
        error = nil;
        states_metadata = nil;
        addedLayers = nil;

        [doc showMessage:"Export Complete"]

      })

      [doc setCurrentPage:page]
      [doc showMessage:"Export on its way"]
    }
  }

  log('########################################################################');
}())