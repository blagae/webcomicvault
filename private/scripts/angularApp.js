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
		postPromise: ['comics', 'auth', function(comics, auth){
			if (auth.isLoggedIn()) {
				var user = auth.currentUser();
				return comics.getForUser(user);
			}
			else {
				return comics.getAll();
			}
		}]
	  },
    })
	.state('login', {
	  url: '/login',
	  templateUrl: '/login.html',
	  controller: 'Auth',
	  onEnter: ['$state', 'auth', function($state, auth){
		if(auth.isLoggedIn()){
		  $state.go('home');
		}
	  }]
	})
	.state('register', {
	  url: '/register',
	  templateUrl: '/register.html',
	  controller: 'Auth',
	  onEnter: ['$state', 'auth', function($state, auth){
		if(auth.isLoggedIn()){
		  $state.go('home');
		}
	  }]
	});

    $urlRouterProvider.otherwise('home');
}]);

app.controller('Comics', [
'$scope',
'$stateParams',
'comic',
function($scope, $stateParams, comic){
	$scope.comics = comic;
}]);

app.controller('Nav', [
'$scope',
'auth',
function($scope, auth){
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser();
  $scope.logOut = auth.logOut;
}]);

app.controller('Main', ['$scope', 'comics',
function($scope, comics){
  $scope.welcome = 'Welcome to the Web Comic Vault, your daily fix for online comics.'
  $scope.comicIntro = 'Your currently saved comics are:';
  $scope.comics = comics.comics;
	
  $scope.addComic = function(){
	if(!$scope.title || $scope.title === '') { return; }
	  comics.create({
		title: $scope.title,
		url: $scope.url,
	  });
    $scope.title = '';
    $scope.url = '';
  };
}
]);
app.factory('comics', ['$http', 'auth', function($http, auth){
  var o = {
  comics: []
  };
    o.getAll = function() {
		return $http.get('/comics').success(function(data){
      angular.copy(data, o.comics);
    });
  };
  o.getForUser = function(user) {
	return $http.get('/user/' + user + '/comics').success(function(data){
      angular.copy(data, o.comics);
    });
  };
  o.create = function(comic) {
  return $http.post('/comics', comic, {
    headers: {Authorization: 'Bearer '+auth.getToken()} // TODO: remember this
  }).success(function(data){
    o.comics.push(data);
  });
};

  return o;
}]);

app.factory('auth', ['$http', '$window', function($http, $window){
   var auth = {};
	auth.saveToken = function (token){
	  $window.localStorage['webcomicvault-token'] = token;
	};

	auth.getToken = function (){
	  return $window.localStorage['webcomicvault-token'];
	}
	
	auth.isLoggedIn = function(){
	  var token = auth.getToken();

	  if(token){
		var payload = JSON.parse($window.atob(token.split('.')[1]));

		return payload.exp > Date.now() / 1000;
	  } else {
		return false;
	  }
	};
	auth.currentUser = function(){
	  if(auth.isLoggedIn()){
		var token = auth.getToken();
		var payload = JSON.parse($window.atob(token.split('.')[1]));

		return payload.username;
	  }
	};
	auth.register = function(user){
	  return $http.post('/user/register', user).success(function(data){
		auth.saveToken(data.token);
	  });
	};
	
	auth.logIn = function(user){
	  return $http.post('/user/login', user).success(function(data){
		auth.saveToken(data.token);
	  });
	};
	auth.logOut = function(){
	  $window.localStorage.removeItem('webcomicvault-token');
	};
	
  return auth;
}]);

app.controller('Auth', [
'$scope',
'$state',
'auth',
function($scope, $state, auth){
  $scope.user = {};

  $scope.register = function(){
    auth.register($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('home');
    });
  };

  $scope.logIn = function(){
    auth.logIn($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('home');
    });
  };
}])

// TODO: make safe
function cleanUrl(url) {
	if (url.startsWith('http')) {
		return url;
	}
	else {
		return 'http://'+url;
	}
}