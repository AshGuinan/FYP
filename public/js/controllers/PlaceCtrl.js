angular.module('PlaceCtrl', []).controller('PlaceController', ['$scope', '$http', function($scope, $http) {
	var map;
	var markers = [];
	var newPlace;
	var nPData = new google.maps.InfoWindow();
	var service;
	var galway = new google.maps.LatLng(53.272931, -9.0631102);
	
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
	console.log('Place Controller activated');

//TODO: Choose location! Popular/List

	function initMap() {
		map = new google.maps.Map(document.getElementById('map'), {
			center: galway,
			zoom: 15
		});
		infowindow = new google.maps.InfoWindow();
		service = new google.maps.places.PlacesService(map);
		
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

	$scope.search = function(){
		service.nearbySearch({
			location: map.getCenter(),
			radius: $scope.radius,
			type: ['cafe']
		}, callback);
	};

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
			place.price_level = " No Rating Available"
		}
		google.maps.event.addListener(marker, 'click', function() {
			content = 
				'<div>'+
					'<h3>' + place.name + '</h3>'+ 
					'<p> This Address: ' +  place.vicinity + '</p>' +
					'<p> Rating:' + place.rating + '</p>' +
					'<p> Price Level' + place.price_level + '</p>' + 
					'<a ng-click=upvote("' + place.id + '")> Likes </a>' +
					'<a ng-click=downvote("' + place.id + '")> Dislikes </a>' +
				'</div>';

			infowindow.setContent( $compile(content)($scope)[0] )
			infowindow.open(map, this);
		});
	}

	function createMarkerFromCustomPlace(customPlace){
		console.log("adding custom place:", customPlace)
		createMarker({
			id: customPlace.id,
			name: customPlace.name,
			vicinity: customPlace.address,
			geometry: {
				location: new google.maps.LatLng(customPlace.lat, customPlace.long)
		}});
	}

$http.get('/fetchPlaces')
		.then(function (data){
			var places = data.data;
			console.log("fetched " + places.length +" custom places from the server");
            for(i=0;i<places.length;i++){
        		createMarkerFromCustomPlace(places[i]);
        		console.log(places[i].id);
            }

		},function (error){
			console.log(error);
		});

//Do the things!
	initMap();
	// map.addListener("bounds_changed",$scope.search,false);
}]);