angular.module('DEBUG', ['treeControl'])
.controller('treeCtrl', ['$scope', '$http', function($scope, $http) {
  $scope.lastClicked = null;
  $scope.buttonClick = function($event, node) {
    $scope.lastClicked = node;
    $event.stopPropagation();
  };
  $scope.showSelected = function(sel) {
    $scope.selectedNode = sel;
  };

  $scope.treeOptions = {
    nodeChildren: "children",
    dirSelectable: true
  };
  $scope.promise = $http.get('/seps')
  .then(
    function(answer) {
      $scope.dataForTheTree = answer.data;
    },
    function(error) {
    },
    function(progress) {
    }
  );

}])
;
