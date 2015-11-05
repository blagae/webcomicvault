var app = angular.module('comicvault', []);

app.controller('Main', ['$scope',
function($scope){
  $scope.welcome = 'Welcome to the Comic Vault, your daily fix for webcomics.'
  $scope.comicIntro = 'Your currently saved comics are:';
  $scope.comics = [{title: 'XKCD', url: 'http://xkcd.com'},
	{title: 'Questionable Content', url: 'http://questionablecontent.net'},
	{title: 'Oglaf', url: 'http://oglaf.com'},
	{title: 'A Softer World', url: 'http://asofterworld.com'}];
	
  $scope.addComic = function(){
    $scope.comics.push({title: $scope.title, url: cleanUrl($scope.url)});
    $scope.title = '';
    $scope.url = '';
  };
}
]);
// TODO: make safe
function cleanUrl(url) {
	if (url.startsWith('http')) {
		return url;
	}
	else {
		return 'http://'+url;
	}
}