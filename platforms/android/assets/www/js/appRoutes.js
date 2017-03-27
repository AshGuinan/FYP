angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

	$routeProvider
		// home page
		.when('/', {
			templateUrl: 'views/home.html',
			controller: 'PlaceController'
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
			templateUrl: 'views/places.html',
			controller: 'PlaceController'
		});

	$locationProvider.html5Mode(false);

}]);