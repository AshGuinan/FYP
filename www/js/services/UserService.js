angular
	.module('UserService', [])
	.factory('User', ['$http', '$route', '$location', function($http, $route, $location) {

	User = {};


	User.fetchLoggedInUser = function(callback){
		$http.get(SERVER_ROOT + 'me').then(
			function (success){
				console.log("success getting user from /me endpoint", success);
	            if( typeof success.data == 'object' && success.data.userName !== ""){
                	console.log('logged om')
	                callback(success.data);
	           	} else {
                	console.log('null')
	                callback(null);
	           	}
			},
			function (error){
				console.log("error fetching User: " + error);
                callback(null);
		});
	};

	User.updateUserDetails = function(data, callback){
		$http
			.post(SERVER_ROOT + 'updateDetails')
			.then(function(response){
				console.log('updated user details', response);
				callback(response.date);
			})
	}

	User.verify = function(id){
		console.log(id);
		if($scope.isAdmin){
			var data = {placeId:id};
			console.log('Hai thar');
			$http.post(SERVER_ROOT + 'verify', data).then(function (data){
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
		$http.get(SERVER_ROOT + 'api/logout').then(function(success){
			console.log('logged out');
			$location.path('/');
		});      
	}

	User.login = function(user, callback){
		console.log('login...');
		$http
			.post(SERVER_ROOT + 'api/login', user)
			.then(function(response){
				callback(response.data)
		});      
	};

	User.signup = function(user, callback){
		console.log('signup...');
		$http
			.post(SERVER_ROOT + 'api/signup', user)
			.then(function(response){
				callback(response.data)
		});      
	};

	return User;
}]);