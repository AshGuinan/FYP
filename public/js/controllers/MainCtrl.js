angular.module('MainCtrl', []).controller('MainController', ['$scope', '$rootScope', '$http', '$compile', function($scope, $rootScope, $http, $compile) {
	//$scope.user = 'Welcome!';
	$scope.radius = 1000;
	$scope.markers =[];
	$scope.newUnsavedPlace = null;
	$scope.playgrounds =[];
	$scope.lat;
	$scope.long;
	$scope.newPlace = {
		name: '',
		address: '',
		type: '',
		lat: 0,
		long: 0,
		user: null
	}
	var map;
	var markers = [];
	var newPlace;
	var nPData = new google.maps.InfoWindow();
	var service;
	var galway = new google.maps.LatLng(53.272931, -9.0631102);
	$rootScope.latlong;

	function initMap() {
		map = new google.maps.Map(document.getElementById('map'), {
			center: galway,
			zoom: 15
		});

		infowindow = new google.maps.InfoWindow();
		service = new google.maps.places.PlacesService(map);
		// map.addListener("bounds_changed",$scope.search,false);

		// service.nearbySearch({
		// 	location: galway,
		// 	radius: $scope.radius,
		// 	type: ['movie_theater']
		// }, callback);

		google.maps.event.addListener(map, 'click', function(event){
			if($scope.newUnsavedPlace != null) {
				$scope.newUnsavedPlace.setMap(null)
			}
			$scope.newUnsavedPlace = new google.maps.Marker({
	            position: event.latLng,
	            map: map
          	});
          	nPData.setContent($compile(document.getElementById('newData').innerHTML)($scope)[0]);

          	$scope.newPlace.lat = $scope.newUnsavedPlace.position.lat();
          	$scope.newPlace.long = $scope.newUnsavedPlace.position.lng();
          	$scope.$apply();
          	// open new place popup form right away on the first click
          	nPData.open(map, $scope.newUnsavedPlace);
		});
	}	

	initMap();
	// $scope.search = function(){
	// 	service.nearbySearch({
	// 		location: map.getCenter(),
	// 		radius: $scope.radius,
	// 		type: ['cafe']
	// 	}, callback);
	// };

	$scope.saveData = function(){
		console.log('saved!');
	}

	function removeMarkers(){
		for(var i=0; i<markers.length; i++){
			markers[i].setMap(null);
		}
	}

	var clearMarker = document.getElementById("clearMarkers");
	clearMarker.addEventListener("click", removeMarkers, false);

	function callback(results, status, pagination) {
		if (status === google.maps.places.PlacesServiceStatus.OK) {
			for (var i = 0; i < results.length; i++) {
				createMarker(results[i]);
				// console.log(results[i]);
			}
		}
		if (pagination.hasNextPage) {
			console.log('loading next page of results for radius' + $scope.radius);
			pagination.nextPage();
		} 
	}


	function createMarker(place) {
		var marker = new google.maps.Marker({
			map: map,
			position: place.geometry.location
		});
		markers.push(marker);
		if(place.rating == undefined){
			place.rating = " No Rating Available"
		}
		if(place.price_level == undefined){
			place.rating = " No Rating Available"
		}
		google.maps.event.addListener(marker, 'click', function() {
			infowindow.setContent('<h3>' + place.name + '</h3>'+ '<p>'+ 'This Address: ' +  place.vicinity + '</p>' +' Rating:' +place.rating + '<p>'+ 'Price Level' + place.price_level + '</p>');
			infowindow.open(map, this);
		});
	}

	function createMarkerFromCustomPlace(customPlace){
		console.log("adding custom place:", customPlace)
		createMarker({
			name: customPlace.name,
			vicinity: customPlace.address,
			geometry: {
				location: new google.maps.LatLng(
	    			customPlace.lat, 
	    			customPlace.long)
		}});
	}


	$http.get('/me')
		.then(function (success){
			console.log("success getting user from /me endpoint", success);
            if(success.data.name!==""){
                $rootScope.user = success.data.name;
                $scope.newPlace.user = success.data.name;
            }
			console.log($rootScope.user);
			console.log("Success: "+success);
		},function (error){
			console.log("error: " + error);
		});

	$http.get('/fetchPlaces')
		.then(function (data){
			var places = data.data;
			console.log("fetched " + places.length +" custom places from the server");
            for(i=0;i<places.length;i++){
        		createMarkerFromCustomPlace(places[i]);
            }

		},function (error){
			console.log(error);
		});

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
			$scope.newUnsavedPlace.setMap(null);
			$scope.newUnsavedPlace = null;
		},function(error){
			console.log('error', error)
		});
	}
	//Fetch playgrounds -- galway
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