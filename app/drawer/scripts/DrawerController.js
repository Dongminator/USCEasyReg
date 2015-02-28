angular
  .module('drawer')
  .controller('DrawerController', function($scope, supersonic) {

    /*supersonic.ui.drawers.whenWillShow(function() {
        supersonic.logger.log("Drawers will show"); 
    });*/
    
    $scope.navbarTitle = "Drawer";
    var courses;
    $scope.getJson = function () {
    	courses = JSON.parse(window.localStorage.getItem('EasyReg.interestedCourses'));
        supersonic.logger.debug(courses);
        $scope.courses = courses;
    };
    
    //$scope.courses = "";
     $scope.toggleCourse = function(course) {
		  if (course.expanded === true) {
			  course.expanded = false;
		  } else {
			  course.expanded = true;
		  }
	  };
	  
	  $scope.isGroupShown = function(course) {
		  if (course.expanded === true) {
			  return true;
		  } else {
			  return false;
		  }
	  };
	  
      supersonic.ui.drawers.whenWillShow(function() {
         $scope.getJson();
        });
	 
	  // filter functions - set isEnabledByDay, isEnabledByTime, isEnabledByCode, isEnabledByUnits
	  $scope.isCourseRegistered = function(course) {
		  return course.isRegistered;
	  };
	  
	  $scope.isSectionRegistered = function (section) {
		  return section.isRegistered;
	  };
        
    $scope.setScheduled = function(course, section){
        var sectionList = course.sections;
        course.isScheduled = true;
        for(var s in sectionList){
            if(sectionList[s].SECTION_ID !== section.SECTION_ID ){
                sectionList[s].isScheduled = false;
            }else{
                sectionList[s].isScheduled = true;
            }
        }
        window.localStorage.setItem('EasyReg.interestedCourses', JSON.stringify(courses));
        for(var s in sectionList){
            supersonic.logger.debug(sectionList[s].SECTION_ID+": "+sectionList[s].isScheduled);
        }
        
        // Broadcast a message to all other views.
        var message = {
        		  sender: "drawer#drawer",
        		  contet: "refresh"
        };
        supersonic.data.channel('public_announcements').publish(message);
    };
    
    
    
  });