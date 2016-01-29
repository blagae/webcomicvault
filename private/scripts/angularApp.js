var app = angular.module('webcomicvault', ['ui.router']);

app.config([
    '$stateProvider',
    '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: '/home.html',
                controller: 'Main'
            })
            .state('login', {
                url: '/login',
                templateUrl: '/login.html',
                controller: 'Auth',
                onEnter: ['$state', 'auth', function ($state, auth) {
                        if (auth.isLoggedIn()) {
                            $state.go('home');
                        }
                    }]
            })
            .state('register', {
                url: '/register',
                templateUrl: '/register.html',
                controller: 'Auth',
                onEnter: ['$state', 'auth', function ($state, auth) {
                        if (auth.isLoggedIn()) {
                            $state.go('home');
                        }
                    }]
            })
            .state('user', {
                url: '/user',
                templateUrl: '/user.html',
                controller: 'User',
                onEnter: ['$state', 'auth', function ($state, auth) {
                        if (!auth.isLoggedIn()) {
                            $state.go('home');
                        }
                    }],
                resolve: {
                    postPromise: ['auth', function (auth) {
                            if (auth.isLoggedIn()) {
                                return auth.currentUser();
                            }
                        }]
                }
            })
            .state('usercomics', {
                url: '/user/comics',
                templateUrl: '/user/comics.html',
                controller: 'UserComics'

            })
            .state('about', {
                url: '/about',
                templateUrl: '/about.html',
                controller: 'Nav'

            })
            .state('comic', {
                url: '/comics/{comicid}',
                templateUrl: '/comic.html',
                controller: 'Comic'
            })
            .state('comics', {
                url: '/comics',
                templateUrl: '/comics.html',
                controller: 'Comics'
            })
            .state('categories', {
                url: '/categories',
                templateUrl: '/categories.html',
                controller: 'Categories'
            })
            .state('category', {
                url: '/category/{catid}',
                templateUrl: '/category.html',
                controller: 'Category'
            });
            
        $urlRouterProvider.otherwise('home');
    }]);

app.controller('Category', [
    '$scope',
    '$stateParams',
    'categories',
    function ($scope, $stateParams, categories) {
        categories.get($stateParams.catid);
        categories.getComicsFor($stateParams.catid);
        $scope.category = categories.categories;
        
        $scope.comics = categories.comics;
    }
]);

app.controller('Categories', [
    '$scope',
    '$stateParams',
    'categories',
    function ($scope, $stateParams, categories) {
        categories.getAll();
        $scope.categories = categories.categories;
    }
]);

app.controller('Comics', [
    '$scope',
    '$stateParams',
    'comics',
    function ($scope, $stateParams, comics) {
        comics.getAll();
        $scope.comics = comics.comics;
    }]);

app.controller('Comic', [
    '$scope',
    '$stateParams',
    'comics',
    'strips',
    function ($scope, $stateParams, comics, strips) {
        strips.getAll($stateParams.comicid);
        $scope.strips = strips.strips;
        comics.getComic($stateParams.comicid);
        $scope.comic = comics.comics;
    }]);

app.controller('User', [
    '$scope',
    '$stateParams',
    'auth',
    function ($scope, $stateParams, auth) {
        $scope.user = auth.currentUser();
    }]);


app.controller('Nav', ['$scope', 'auth',
    function ($scope, auth) {
        $scope.isLoggedIn = auth.isLoggedIn;
        $scope.currentUser = auth.currentUser();
        $scope.logOut = auth.logOut;
    }
]);


app.controller('Main', ['$scope',
    function ($scope) {
        $scope.welcome = 'Welcome to the Web Comic Vault, your daily fix for online comics.';
        $scope.comicIntro = 'Your currently saved comics are:';
    }
]);

app.controller('Favs', ['$scope', 'auth', 'comics',
    function ($scope, auth, comics) {
        $scope.isLoggedIn = auth.isLoggedIn;
        $scope.currentUser = auth.currentUser();
        $scope.logOut = auth.logOut;
        if (auth.isLoggedIn()) {
            comics.getForUser(auth.currentUser());
        } else {
            comics.getAll();
        }
        $scope.favs = comics.comics;
    }
]);

app.controller('UserComics', ['$scope', 'auth', 'comics',
    function ($scope, auth, comics) {
        $scope.isLoggedIn = auth.isLoggedIn;
        $scope.currentUser = auth.currentUser();
        $scope.logOut = auth.logOut;
        if (auth.isLoggedIn()) {
            comics.getForUser(auth.currentUser());
        } else {
            comics.getAll();
        }
        $scope.favs = comics.comics;
    }
]);

app.controller('Auth', [
    '$scope',
    '$state',
    'auth',
    function ($scope, $state, auth) {
        $scope.user = {};

        $scope.register = function () {
            auth.register($scope.user).error(function (error) {
                $scope.error = error;
            }).then(function () {
                $state.go('home');
            });
            $scope.title = '';
            $scope.url = '';
        };

        $scope.logIn = function () {
            auth.logIn($scope.user).error(function (error) {
                $scope.error = error;
            }).then(function () {
                $state.go('home');
            });
        };
    }]);

// TODO: make safe
function cleanUrl(url) {
    if (url.startsWith('http')) {
        return url;
    }
    else {
        return 'http://' + url;
    }
}


app.factory('strips', ['$http', function ($http) {
        var payload = {
            strips: []
        };
        payload.getAll = function (id) {
            return $http.get('/comics/' + id + '/strips').success(function (data) {
                angular.copy(data, payload.strips);
            });
        };
        return payload;
    }]);

app.factory('categories', ['$http', function ($http) {
        var payload = {
            categories: [],
            comics: []
        };
        payload.getAll = function () {
            return $http.get('/categories').success(function (data) {
                angular.copy(data, payload.categories);
            });
        };
        payload.get = function (catid) {
            return $http.get('/categories/' + catid).success(function (data) {
                angular.copy(data, payload.categories);
            });
        };
        payload.getComicsFor = function (catid) {
            return $http.get('/categories/' + catid + "/comics").success(function (data) {
                angular.copy(data, payload.comics);
            });
        };
        return payload;
    }]);

app.factory('comics', ['$http', 'auth', function ($http, auth) {
        var payload = {
            comics: []
        };
        payload.getAll = function () {
            return $http.get('/comics').success(function (data) {
                angular.copy(data, payload.comics);
                payload.comics = [];
            });
        };
        payload.getComic = function (id) {
            return $http.get('/comics/' + id).success(function (data) {
                angular.copy(data, payload.comics);
                payload.comics = [];
            });
        };
        payload.getForUser = function (user) {
            return $http.get('/user/' + user + '/comics', {
                headers: {Authorization: 'Bearer ' + auth.getToken()} // TODO: remember this
            }).success(function (data) {
                angular.copy(data, payload.comics);
                payload.comics = [];
            });
        };
        payload.create = function (comic) {
            return $http.post('/comics', comic, {
                headers: {Authorization: 'Bearer ' + auth.getToken()} // TODO: remember this
            }).success(function (data) {
                payload.comics.push(data);
            });
        };

        return payload;
    }]);

app.factory('auth', ['$http', '$window', function ($http, $window) {
        var auth = {};
        auth.saveToken = function (token) {
            $window.localStorage['webcomicvault-token'] = token;
        };

        auth.getToken = function () {
            return $window.localStorage['webcomicvault-token'];
        };

        auth.isLoggedIn = function () {
            var token = auth.getToken();

            if (token) {
                var payload = JSON.parse($window.atob(token.split('.')[1]));

                return payload.exp > Date.now() / 1000;
            } else {
                return false;
            }
        };
        auth.currentUser = function () {
            if (auth.isLoggedIn()) {
                var token = auth.getToken();
                var payload = JSON.parse($window.atob(token.split('.')[1]));

                return payload.username;
            }
        };
        auth.register = function (user) {
            return $http.post('/user/register', user).success(function (data) {
                auth.saveToken(data.token);
            });
        };

        auth.logIn = function (user) {
            return $http.post('/user/login', user).success(function (data) {
                auth.saveToken(data.token);
            });
        };
        auth.logOut = function () {
            return $http.get('/user/logout').success(function (data) {
                $window.localStorage.removeItem('webcomicvault-token');
            }).error(function (data, status){
                $window.localStorage.removeItem('webcomicvault-token');
            });
        };

        return auth;
    }]);