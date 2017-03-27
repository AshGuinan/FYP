angular.module('UserCtrl', ['ionic']).controller('UserController', [ '$scope', '$http', '$location','Place', function($scope, $http, $location, Place) {
	$scope.currentUser = {}

	$scope.updateUserDetails = function(){
		console.log('updateUserDetails', $scope.currentUser)
		User.updateUserDetails($scope.currentUser, function(user){
			$scoep.currentUser = user;
			$location.path('/places');
		})
	};

	User.fetchLoggedInUser(function(user){
		if(user == null){
			$location.path('/');
			return;
		}
		$scope.currentUser = user;
	});

}]);