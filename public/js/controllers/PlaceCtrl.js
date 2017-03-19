angular.module('PlaceCtrl', []).controller('PlaceController', ['$scope', '$http', '$compile', function($scope, $http, $compile) {
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
	$scope.education = ['aquarium', 'book_store','museum'];
	$scope.indoorFun = ['bowling_alley','movie_theatre'];
	$scope.food = ['bakery', 'cafe','restaurant'];
	$scope.outdoors = ['amusement_park', 'park','zoo'];
	$scope.culture = ['art_gallery', 'library'];
	$scope.goodToKnow = ['ATM', 'Bank','Gas_Station', 'taxi_stand', 'train_station', 'transit_station', 'post_office', 'pharmacy'];
	$scope.ICE = ['police', 'hospital', 'doctor', 'dentist', 'embassy', 'car_repair'];
	$scope.allTypes =  $scope.education.concat( 
			$scope.indoorFun.concat(
				$scope.food.concat(
					$scope.outdoors.concat(
						$scope.culture.concat( 
							$scope.goodToKnow.concat($scope.ICE)
						)
					)
				)
			)
		).sort(); 

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

	$scope.search = function(input){
		var sType = $scope[input];
		console.log('searching for '+ input);
		console.log(sType)
		for(var x=0; x<sType.length; x++){
			type = sType[x]
			service.nearbySearch({
				location: map.getCenter(),
				radius: $scope.radius,
				type: [type]
			}, callback.bind(input));
		}
	};

	$scope.addPlace = function(){
		console.log('submiting new place');
		console.log($scope.newPlace);
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
	
	$scope.recommend = function(){
		$http.get('/recommendations').then(function(success){
			console.log(success);
			$scope.recs = success;
		});
	}

	function callback(results, status, pagination) {
		var type = this.toString();
		console.log("trggering callback for place of type: ",type);
		if (status === google.maps.places.PlacesServiceStatus.OK) {
			for (var i = 0; i < results.length; i++) {
				createMarker(results[i]);
				//console.log(results[i]);
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
		var type = (place.types[0]).replace("_"," ");
		google.maps.event.addListener(marker, 'click', function() {
			content = 
				'<div>'+
					'<h3>' + place.name + '</h3>'+ 
					'<p> Type: ' +  type + '</p>' +
					'<p> This Address: ' +  place.vicinity + '</p>' +
					'<p> Google Rating:' + place.rating + '</p>' +
					'<p> Price Level' + place.price_level + '</p>' + 
					'<a ng-click=upvote("' + place.id + '")> I liked it! </a>' +
					'<a ng-click=downvote("' + place.id + '")> Not for me...  </a>' +
				'</div>';

			infowindow.setContent( $compile(content)($scope)[0] )
			infowindow.open(map, this);
		});
	}

	function createMarkerFromCustomPlace(customPlace){
		console.log("adding custom place:", customPlace)
		var loc = new google.maps.LatLng(customPlace.lat, customPlace.long);
		var dist = google.maps.geometry.spherical.computeDistanceBetween(galway,loc);
		console.log(dist);
		if (dist<=$scope.radius){
			createMarker({
				id: customPlace.id,
				types: [customPlace.type],
				name: customPlace.name,
				vicinity: customPlace.address,
				geometry: {
					location: loc
				}
			});	
		}	
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