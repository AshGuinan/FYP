angular.module('MainCtrl', []).controller('MainController', ['$scope', '$rootScope', '$http', '$compile', function($scope, $rootScope, $http, $compile) {
	$scope.user = 'Welcome!';
	
	$rootScope.latlong;

	$scope.saveData = function(){
		console.log('saved!');
	}

	// function removeMarkers(){
	// 	for(var i=0; i<markers.length; i++){
	// 		markers[i].setMap(null);
	// 	}
	// }

	//var clearMarker = document.getElementById("clearMarkers");
	//clearMarker.addEventListener("click", removeMarkers, false);

	$http.get('/me')
		.then(function (success){
			console.log("success getting user from /me endpoint", success);
            if(success.data.name!==""){
                $rootScope.user = success.data.name;
                //$scope.newPlace.user = success.data.name;
            }
			console.log($rootScope.user);
			console.log("Success: "+success);
		},function (error){
			console.log("error: " + error);
		});

	$http.get('/fetchAllPlaces')
		.then(function (data){
			$scope.allPlaces = data.data;
			console.log('Success fetching places');
		},function (error){
			console.log('Fail');
		});

	$scope.upvote = function(place){
		console.log('Upvote place', place);
		$http.post('/upvote', {place: place}).then(function(success){
			console.log('upvoted!');
		})
	}

	$scope.downvote = function(place){
		console.log('Downvote place', place);
		$http.post('/downvote', {place: place}).then(function(success){
			console.log('downvoted!');
		})
	}

	$scope.addPlace = function(){
		console.log('submiting new place')
		console.log($scope.newPlace)
		// reset $scope.newPlace after success
		$http.post('/addPlace', $scope.newPlace).then(function(success){
			console.log('success', success)
			createMarkerFromCustomPlace(success.data);
			// reset form
			$scope.newPlace.name = '';
			$scope.newPlace.type = '';
			$scope.newPlace.address = '';
			nPData.close();
			//$scope.newUnsavedPlace.setMap(null);
			$scope.newUnsavedPlace = null;
		},function(error){
			console.log('error', error)
		});
	}

	$scope.verify = function(id){
		console.log(id);
		var data = {placeId:id};
		console.log('Hai thar');
		$http.post('/verify', data).then(function (data){
				console.log('verifying...');
			},function (error){
				console.log(error);
			});
	}

	$scope.content = null;
	//$http.get('/data/galway_playgrounds.json').then(yay, nay);

	function yay(response) {
		$scope.contents = response;
		console.log('galway playgrounds loaded!');
		for (var i =0;i<response.data.data.length;i++){
			$scope.playgrounds.push(response.data.data[i].Playground + ', ' + response.data.data[i].Location_o);
			//console.log(i);
			console.log(response.data.data[i].Playground + ', ' + response.data.data[i].Location_o);

		}
	}
	function nay(response) {
		console.log('error loading playgrounds');
		console.log(response);
	}

}]);