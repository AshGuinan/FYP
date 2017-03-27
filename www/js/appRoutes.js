angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

	$routeProvider
		// home page
		.when('/', {
			templateUrl: 'views/login.html',
			controller: 'LoginController'
		})
		.when('/user', {
			templateUrl: 'views/user.html',
			controller: 'UserController'
		})
		.when('/fail', {
			templateUrl: 'views/fail.html',
			controller: 'UserController'
		})
		.when('/places', {
			templateUrl: 'views/place.html',
			controller: 'PlaceController'
		});

	$locationProvider.html5Mode(false);

}]);