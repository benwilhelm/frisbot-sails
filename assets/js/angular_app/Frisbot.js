var app = angular.module("Frisbot", [
  'Frisbot.home',
  'Frisbot.games',
  'ui.router'
]);


app.config(function(
  $stateProvider,
  $urlRouterProvider
){

  $urlRouterProvider.otherwise("/");

  $stateProvider
  .state("home", {
    url: "/",
    templateUrl: "templates/home.html",
    controller: "HomeController"
  })

  .state("game", {
    url: "/game",
    templateUrl: "templates/games/detail.html",
    controller: "GameDetailController"
  })

})