

var app = angular.module('main');

app.controller('SelectLevelsController', function($scope, supersonic, $http) {
	
	  $scope.levels = JSON.parse(window.localStorage.getItem('EasyReg.SelectLevelsControllers.levels'));
	  
	  $scope.update = function () {
		  window.localStorage.setItem('EasyReg.SelectLevelsControllers.levels', JSON.stringify($scope.levels));
	  };
});

