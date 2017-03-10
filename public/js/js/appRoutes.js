angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

	$routeProvider
		// home page
		.when('/', {
			templateUrl: 'views/home.html',
			controller: 'MainController'
		})

		.when('/user', {
			templateUrl: 'user',
			controller: 'UserController'
		})

		.when('/fail', {
			templateUrl: 'views/fail.html',
			controller: 'UserController'
		})

		.when('/places', {
			templateUrl: 'places',
			controller: 'PlaceController'
		})

	.when('/logout', {
		templateUrl: 'logout',
		controller: 'MainController'
	});

	$locationProvider.html5Mode(true);

}]);