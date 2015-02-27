

var app = angular.module('main');

app.controller('SelectUnitsController', function($scope, supersonic, $http) {
	
	  $scope.units = JSON.parse(window.localStorage.getItem('EasyReg.SelectUnitsControllers.units'));
	  
	  $scope.update = function () {
		  window.localStorage.setItem('EasyReg.SelectUnitsControllers.units', JSON.stringify($scope.units));
	  };
});

