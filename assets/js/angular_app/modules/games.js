var module = angular.module("Frisbot.games", ["ngResource"])

module.factory("Game", ["$resource", function($resource){
  return $resource('/games/:id')
}])

module.controller("GameDetailController", function($scope){
  $scope.foo = 'whee';
})