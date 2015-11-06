var app = angular.module('webcomicvault', ['ui.router']);

app.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: '/home.html',
      controller: 'Main',
	  resolve: {
		postPromise: ['comics', function(comics){
		  return comics.getAll();
		}]
	  }
    });

    $urlRouterProvider.otherwise('home');
}]);

app.controller('Comics', [
'$scope',
'$stateParams',
'comics',
function($scope, $stateParams, comics){
	$scope.comic = comics.comic[$stateParams.id]; // TODO: might have to be plural ?
}]);

app.controller('Main', ['$scope', 'comics',
function($scope, comics){
  $scope.welcome = 'Welcome to the Web Comic Vault, your daily fix for online comics.'
  $scope.comicIntro = 'Your currently saved comics are:';
  $scope.comics = comics.comics;
	
  $scope.addComic = function(){
    $scope.comics.push({title: $scope.title, url: cleanUrl($scope.url)});
    $scope.title = '';
    $scope.url = '';
  };
}
]);
app.factory('comics', ['$http', function($http){
  var o = {
  comics: []
  };
    o.getAll = function() {
		return $http.get('/comics').success(function(data){
      angular.copy(data, o.comics);
    });
  };

  return o;
}]);



// TODO: make safe
function cleanUrl(url) {
	if (url.startsWith('http')) {
		return url;
	}
	else {
		return 'http://'+url;
	}
}