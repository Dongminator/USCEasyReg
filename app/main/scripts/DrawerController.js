angular
  .module('main')
  .controller('DrawerController', function($scope, supersonic) {

	  
	  $scope.getJson = function () {
		  var courses = window.localStorage.getItem('EasyReg.interestedCourses');
		  supersonic.logger.debug("Courses: " + courses);
	  };
  });