angular.module('UserCtrl', ['ionic']).controller('UserController', [ '$scope', '$http', '$location','Place', 'User', function($scope, $http, $location, Place, User) {
	$scope.currentUser = {}

	$scope.updateUserDetails = function(){
		console.log('updateUserDetails', $scope.currentUser)
		User.updateUserDetails($scope.currentUser, function(user){
			$scope.currentUser = user;
			$location.path('/places');
		})
	};
	$scope.goBack = function(){	
		$location.path('/places');
	}

	User.fetchLoggedInUser(function(user){
		if(user == null){
			$location.path('/');
			return;
		}
		$scope.currentUser = user;
	});

}]);