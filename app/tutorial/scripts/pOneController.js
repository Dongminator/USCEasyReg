angular
  .module('tutorial')
  .controller('pOneController', function($scope, supersonic, $http) {
	
	  $scope.navigate = function (page) {
		  var view = new supersonic.ui.View("tutorial#" + page);
		  supersonic.ui.layers.push(view);
	  }
	  
	  $scope.navigateHome = function (page) {
		  supersonic.ui.navigationBar.hide();
		  supersonic.ui.layers.replace("select-class");
	  }
});