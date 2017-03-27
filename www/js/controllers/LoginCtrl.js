angular
.module('LoginCtrl', ['ionic'])
.controller('LoginController', 
	[
		'$scope', 
		'$rootScope', 
		'$http', 
		'$compile',
		'User', 
		function($scope, $rootScope, $http, $compile, User) {

	$scope.user = {
		userName: '',
		password: ''
	};

	User.login(user, function(response){
		console.log(response);
	})

}]);