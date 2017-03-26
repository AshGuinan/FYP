angular
	.module('UserService', [])
	.factory('User', ['$http', function($http) {

	User = {};


	User.fetchLoggedInUser = function(callback){
		$http.get('/me').then(
			function (success){
				console.log("success getting user from /me endpoint", success);
	            if(success.data.userName !== ""){
	                callback(success.data);
	           	} else {
	                callback(null);
	           	}
			},
			function (error){
				console.log("error fetching User: " + error);
                callback(null);
		});
	};

	User.verify = function(id){
		console.log(id);
		if($scope.isAdmin){
			var data = {placeId:id};
			console.log('Hai thar');
			$http.post('/verify', data).then(function (data){
				console.log('verifying...');
			},function (error){
				console.log(error);
			});
		} else {
			console.log('Nice try pal');
		}
		
	}


	return User;
}]);