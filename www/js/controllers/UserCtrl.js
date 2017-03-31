angular.module('UserCtrl', ['ionic']).controller('UserController', [ '$scope', '$http', '$location','Place', 'User', function($scope, $http, $location, Place, User) {
	$scope.currentUser = {}

	$scope.updateUserDetails = function(){
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
		$scope.isAdmin = user.verified;
		console.log($scope.isAdmin);
	});

	function fetchPlace(){
		$http.get(SERVER_ROOT + 'fetchAllPlaces').then(
			function (data){
				$scope.newPlaces = data.data;
				console.log('places');
				console.log(newPlaces);
	        },
	        function (error){
				console.log('Fail');
			});
	}
	$scope.verify = function(id){
		$http.post(SERVER_ROOT + 'verify',id).then(
			function (data){
				console.log('verified');
	        },
	        function (error){
				console.log('Fail');
			});
	}

	fetchPlace();
}]);