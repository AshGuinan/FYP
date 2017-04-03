angular
.module('LoginCtrl', ['ionic'])
.controller('LoginController', 
	[
		'$scope', 
		'$rootScope', 
		'$http', 
		'$compile',
		'$location',
		'User', 
		function($scope, $rootScope, $http, $compile, $location, User) {
	console.log("Login controller loaded");
	$scope.user = {
		userName: '',
		password: ''
	};
	$scope.showLoginForm = true;

	$scope.login = function(){
		User.login($scope.user, function(user){
			console.log(user);
			if(user != null){
				console.log('go to /places')
				$location.path('/places');
			}
		})
	};


	$scope.signup = function(){
		User.signup($scope.user, function(user){
			console.log(user);
			if(user != null){
				console.log('go to /user')
				$location.path('/user');
			}
		})
	};

	User.fetchLoggedInUser(function(user){
		if(user != null){
			$location.path('/places');
		}
	});

}]);