# Read more about app configs at http://docs.appgyver.com

module.exports =
  app:
    name: "EasyReg"

  # steroidsAppId and steroidsApiKey headers are required by Supersonic Data

#  network:
#    extraResponseHeaders:
#      "Access-Control-Allow-Origin": "*"
#      "Access-Control-Allow-Headers": "Content-Type, X-Requested-With"
    
  webView:
    viewsIgnoreStatusBar: false # show status bar (...AT&T 5:00pm 100%)
    enableDoubleTapToFocus: false
    disableOverscroll: false
    enableViewportScale: false
    enablePopGestureRecognition: true
    allowInlineMediaPlayback: true

  # Applies on iOS only
  statusBar:
    enabled: true
    style: "default"
