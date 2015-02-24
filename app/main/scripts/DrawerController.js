angular
  .module('main')
  .controller('DrawerController', function($scope, supersonic) {

    $scope.navbarTitle = "Drawer";
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
	  
	 
	  // filter functions - set isEnabledByDay, isEnabledByTime, isEnabledByCode, isEnabledByUnits
	  $scope.isCourseRegistered = function(course) {
		  return course.isRegistered;
	  };
	  
	  $scope.isSectionEnabled = function (section) {
		  return section.isEnabledByDay && section.isEnabledByTime && section.isEnabledByCode && section.isEnabledByUnits;
	  };

    
    
    $scope.getJson = function () {
    	var courses = window.localStorage.getItem('EasyReg.interestedCourses');
        supersonic.logger.debug(courses);
    };
  });