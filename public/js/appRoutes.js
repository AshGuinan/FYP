angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

	$routeProvider
		// home page
		.when('/', {
			templateUrl: 'api/frontPage',
			controller: 'PlaceController'
		})
		.when('/user', {
			templateUrl: 'api/user',
			controller: 'UserController'
		})
		.when('/fail', {
			templateUrl: 'views/fail.html',
			controller: 'UserController'
		})
		.when('/places', {
			templateUrl: 'api/places',
			controller: 'PlaceController'
		});

	$locationProvider.html5Mode(true);

}]);