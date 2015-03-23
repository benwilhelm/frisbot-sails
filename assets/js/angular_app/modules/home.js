var module = angular.module("Frisbot.home", ["Frisbot.games"])

module.controller('HomeController', [
  "$scope",
  "$state",
  "Game",
  function($scope, $state, Game){
    Game.query(function(games){
      if (games.length) {
        $state.go("game")
      }
    })
  }
]);