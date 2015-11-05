var app = angular.module('comicvault', []);

app.controller('Main', [
'$scope',
function($scope){
  $scope.contents = 'Welcome to the Comic Vault, your daily fix for webcomics.';
}]);
