var app = angular.module('comicvault', []);

app.controller('Main', ['$scope',
function($scope){
  $scope.welcome = 'Welcome to the Comic Vault, your daily fix for webcomics.'
  $scope.comicIntro = 'Your currently saved comics are:';
  $scope.comics = ['XKCD', 'Questionable Content', 'Oglaf', 'A Softer World'];
}
]);
