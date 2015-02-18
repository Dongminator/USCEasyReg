angular
  .module('school')
  .controller("IndexController", function ($scope, School, supersonic) {
    $scope.schools = null;
    $scope.showSpinner = true;

    School.all().whenChanged( function (schools) {
        $scope.$apply( function () {
          $scope.schools = schools;
          $scope.showSpinner = false;
        });
    });
  });