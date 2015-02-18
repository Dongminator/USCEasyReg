# Read more about app structure at http://docs.appgyver.com
# Donglin: this file defines which view the app will load

module.exports =

  # See styling options for tabs and other native components in app/common/native-styles/ios.css or app/common/native-styles/android.css
  # Donglin: tabs are at the bottom of the screen. We only need 1 tab - the main view (select courses or calendar view)
  # Donglin: also need to change icon css in app/common/native-styles/ tab-bar-item#settings
  # tabs: [
  #   {
  #     title: "Index"
  #     id: "index"
  #     location: "main#getting-started" # Supersonic module#view type navigation
  #   }
  #  ]

  # Donglin: since we dont use tabs, we only need the rootView.
  rootView:
  	location: "main#calendar"

  # Donglin: load all views (we only have about 3 views)
  preloads: [
    {
      id: "select-class"
      location: "main#select-class"
    }
    {
      id: "calendar"
      location: "main#calendar"
    }
  ]
  
  drawers:
    left:
      id: "leftDrawer"
      location: "main#drawer"
      showOnAppLoad: false
    options:
      animation: "swingingDoor"

  # Donglin: initialView is shown before app loads. should show our logo view. 
  # Donglin: can use as login view, or home view. 
  # Donglin: this is actually the login page
#  initialView:
#  	id: "initial-view"
#  	location: "main#initial-view"
