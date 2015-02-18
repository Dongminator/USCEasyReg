angular
  .module('school')
  .controller("EditController", function ($scope, School, supersonic) {
    $scope.school = null;
    $scope.showSpinner = true;

    // Fetch an object based on id from the database
    School.find(steroids.view.params.id).then( function (school) {
      $scope.$apply(function() {
        $scope.school = school;
        $scope.showSpinner = false;
      });
    });

    $scope.submitForm = function() {
      $scope.showSpinner = true;
      $scope.school.save().then( function () {
        supersonic.ui.modal.hide();
      });
    }

    $scope.cancel = function () {
      supersonic.ui.modal.hide();
    }

  });
