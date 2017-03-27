angular
	.module('UserService', [])
	.factory('User', ['$http', '$route', function($http, $route) {

	User = {};


	User.fetchLoggedInUser = function(callback){
		$http.get('http://88.99.186.61:8080/me').then(
			function (success){
				console.log("success getting user from /me endpoint", success);
	            if( typeof success.data == 'object' && success.data.userName !== ""){
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
			$http.post('http://88.99.186.61:8080/verify', data).then(function (data){
				console.log('verifying...');
			},function (error){
				console.log(error);
			});
		} else {
			console.log('Nice try pal');
		}
		
	}

	User.logout = function(){
		console.log('logging out...');
		$http.get('http://88.99.186.61:8080/api/logout').then(function(success){
			console.log('logged out');
			window.location.reload(false); 

		});      
	}


	return User;
}]);