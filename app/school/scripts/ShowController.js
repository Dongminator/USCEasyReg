angular
  .module('school')
  .controller("ShowController", function ($scope, School, supersonic) {
    $scope.school = null;
    $scope.showSpinner = true;
    $scope.dataId = undefined;

    var _refreshViewData = function () {
      School.find($scope.dataId).then( function (school) {
        $scope.$apply( function () {
          $scope.school = school;
          $scope.showSpinner = false;
        });
      });
    }

    supersonic.ui.views.current.whenVisible( function () {
      if ( $scope.dataId ) {
        _refreshViewData();
      }
    });

    supersonic.ui.views.current.params.onValue( function (values) {
      $scope.dataId = values.id;
      _refreshViewData();
    });

    $scope.remove = function (id) {
      $scope.showSpinner = true;
      $scope.school.delete().then( function () {
        supersonic.ui.layers.pop();
      });
    }
  });