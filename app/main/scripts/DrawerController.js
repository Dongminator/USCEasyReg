angular
  .module('main')
  .controller('DrawerController', function($scope, supersonic) {

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

    
    
 
  });