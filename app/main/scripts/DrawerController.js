angular
  .module('main')
  .controller('DrawerController', function($scope, supersonic) {

    $scope.navbarTitle = "Drawer";

    
    
    $scope.getJson = function () {
    	var courses = window.localStorage.getItem('EasyReg.interestedCourses');
        supersonic.logger.debug(courses);
    };
  });