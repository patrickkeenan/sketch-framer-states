// Some sanity checks, before we begin:
var error = check_for_errors()

if(error) { // Stop execution and display error
  alert("Make sure to fix these before we can continue:\n\n" + error)
} else { // Let's go
  
  // When DRY_RUN is true, files won't be saved
  var DRY_RUN = false

  var page = [doc currentPage];
  var artboards = [page artboards];

  if (![artboards count]) {
    [doc showMessage: "Sketch Framer: You must have multiple artboards for this to work"];
    return;
  }else{
    //TODO: disable dropshadow and replace with CSS
    //TODO: Make scroll view work
    //BUG: Maybe it needs to be children rather than layers?

    // Setup
    updateAssetsPage(artboards);

    mainLayer = metadata_for([artboards firstObject])
    mainLayer.x = mainLayer.y = 0;

    //var home_folder = "/Users/" + NSUserName()

    generate_states(artboards);
    create_files();
    //
    new AppSandbox().authorize(home_folder, function(){
      // make_export_folder()
      // save_structure_to_json(ViewsMetadata)
      // var views = ViewsMetadata.getViews()
      // for (var v = 0; v < views.length; v++) {
      //   var view = views[v]
      //   log(view)
      //   export_assets_for_view(view)
      // }
      export_layers();
    })

    

    if(!keep_asset_page) removeAssetsPage();

    views = nil;
    ViewsMetadata = nil;
    error = nil;

    // All done!
    print("Export complete")
    [doc showMessage:"Export Complete"]

    [doc setCurrentPage:page]
    [doc showMessage: "Sketch Framer: Project exported to “" + target_folder + "”"];
  }
}

log('########################################################################');

  
  
  
  
  
  

  

  

  