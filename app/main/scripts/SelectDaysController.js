var app = angular.module('main');

app.controller('SelectDaysController', function($scope, supersonic, $http) {
	
	  $scope.days = JSON.parse(window.localStorage.getItem('EasyReg.SelectDaysControllers.days'));
	  
	  $scope.update = function () {
		  window.localStorage.setItem('EasyReg.SelectDaysControllers.days', JSON.stringify($scope.days));
	  };
	  
	  
	  supersonic.ui.views.current.whenVisible( function() {

		  supersonic.ui.navigationBar.show();
		});
});

