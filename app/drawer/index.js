angular.module('drawer', [
  // Declare here all AngularJS dependencies that are shared by the example module.
  'supersonic'
]);


/*
 * Donglin: we should use initial view to display the logo view and check if user is logged in.
 * after the checking, we call this function and either direct to login or home (calendar view).
 * TODO should set parameter
 */

function dismissInitialView () {
	var animation = supersonic.ui.animate("curlDown");
	supersonic.ui.initialView.dismiss(animation);
	
}

/*
 * Donglin: when closing the drawer, need to load the selected view. 
 * Call layers.replace to change to the selected view. 
 * Then close the drawer.
 */
function closeDrawer(option) {
	supersonic.ui.layers.replace(option);
	supersonic.ui.drawers.close();
}

/*
 * Donglin: Open drawer with option.
 */
function openDrawer(option){
	supersonic.ui.drawers.open(option);
}


