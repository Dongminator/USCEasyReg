angular
  .module('school')
  .controller("NewController", function ($scope, School, supersonic) {
    $scope.school = {};

    $scope.submitForm = function () {
      $scope.showSpinner = true;
      newschool = new School($scope.school);
      newschool.save().then( function () {
        supersonic.ui.modal.hide();
      });
    };

    $scope.cancel = function () {
      supersonic.ui.modal.hide();
    }

  });