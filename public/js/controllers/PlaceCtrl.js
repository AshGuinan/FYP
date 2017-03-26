angular
	.module('PlaceCtrl', ['ionic', '$actionButton'])
	.controller('PlaceController', ['$scope','$http', '$compile','$location', '$actionButton','Place', 'User', '$ionicSideMenuDelegate',
			function($scope, $http, $compile, $location, $actionButton, Place, User, $ionicSideMenuDelegate) { 
	var map;
	var markers = [];
	var newPlace;
	var nPData = new google.maps.InfoWindow();
	var service;
	var Galway = new google.maps.LatLng(53.272931, -9.0631102);
	var Dublin = new google.maps.LatLng(53.3484285,-6.2569559);
	var Cork = new google.maps.LatLng(51.8983147,-8.4822781);
	var Limerick = new google.maps.LatLng(52.6676852,-8.6366651);
	$scope.radius = 50;
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
	};
	
	$scope.education = ['aquarium', 'book_store','museum'];
	$scope.indoorFun = ['bowling_alley','movie_theatre'];
	$scope.food = ['bakery', 'cafe','restaurant'];
	$scope.outdoors = ['amusement_park', 'park','zoo'];
	$scope.culture = ['art_gallery', 'library'];
	$scope.goodToKnow = ['ATM', 'Bank','Gas_Station', 'taxi_stand', 'train_station', 'transit_station', 'post_office', 'pharmacy'];
	$scope.ICE = ['police', 'hospital', 'doctor', 'dentist', 'embassy', 'car_repair'];
	// combine list of all place sub types
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
		$scope.initCenter = Place.userLocationToLatLong($scope.currentUser)
		var mapElement = document.getElementById('map')
		if(mapElement == null)
			return ;
		console.log('mapp element is', mapElement);
		map = new google.maps.Map(mapElement, {
			center: $scope.initCenter,
			zoom: 15,
			zoomControl: true,
			zoomControlOptions: {
				position: google.maps.ControlPosition.LEFT_BOTTOM
			},
			scaleControl: true,
			streetViewControl: true,
			streetViewControlOptions: {
				position: google.maps.ControlPosition.LEFT_BOTTOM
			},
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

	        nPData.setContent(
	        	$compile(document.getElementById('newData').innerHTML)($scope)[0]
	        );
	        $scope.newPlace.lat = $scope.newUnsavedPlace.position.lat();
	        $scope.newPlace.long = $scope.newUnsavedPlace.position.lng();
	        $scope.$apply();
	        // open new place popup form
	        nPData.open(map, $scope.newUnsavedPlace);
		});
	};	

// var clearMarker = document.getElementById("clearMarkers");
// 	clearMarker.addEventListener("click", removeMarkers, false);
	$scope.centerMap =function(location){
		map.setCenter(location);
	};
	$scope.search = function(input){
		var sType = $scope[input];
		console.log('searching for '+ input);
		console.log(sType)
		for(var x=0; x<sType.length; x++){
			type = sType[x]
			console.log(type);
			service.nearbySearch({
				location: map.getCenter(),
				radius: $scope.radius,
				type: [type],
			}, searchCallback.bind(input));
		}
	};

	$scope.addPlace = function(){
		Place.addPlace($scope.newPlace, function(place){
			Place.createMarkerFromCustomPlace(map,place);
			resetNewPlaceForm()
			nPData.close();
		});
	};

	function resetNewPlaceForm(){
		$scope.newPlace.name = '';
		$scope.newPlace.type = '';
		$scope.newPlace.address = '';
		$scope.newUnsavedPlace = null;
	};
		
	function searchCallback(results, status, pagination) {
		var type = this.toString();
		console.log("trggering searchCallback for place of type: ",type);
		if (status === google.maps.places.PlacesServiceStatus.OK) {
			for (var i = 0; i < results.length; i++) {
				createMarker(results[i]);
			}
		}
		if (pagination.hasNextPage) {
			console.log('loading next page of results for radius' + $scope.radius);
			pagination.nextPage();
		} 
	}

	function createMarker(place) {
		var type = (place.types[0]).replace("_"," ");

		var marker = new google.maps.Marker({
			map: map,
			position: place.geometry.location,
		});

		marker.place = place;
		markers.push(marker);
		var placeRating;
		if(place.price_level == undefined){
			place.price_level = " No Information Available";
		}

		if(place.rating == undefined && place.beaconRating !== undefined){
			placeRating = "Beacon Rating: " + place.beaconRating;
		} else if (place.rating !== undefined && place.beaconRating == undefined){
			placeRating = "Google Rating: " + place.rating + " Stars";
		} else if (place.rating == undefined && place.beaconRating == undefined){
			placeRating = " ";
		}
		
		google.maps.event.addListener(marker, 'click', function() {
			content = 
				'<div>'+
					'<h3>' + place.name + '</h3>'+ 
					'<p> Type: ' +  type + '</p>' +
					'<p> This Address: ' + place.vicinity + '</p>' +
					'<p>' + placeRating + '</p>' +
					'<p> Price Level' + place.price_level + '</p>' + 
					'<a ng-click=upvote("' + place.place_id + '") class="ion-checkmark-round"> I liked it! </a>' +
					'<a ng-click=downvote("' + place.place_id + '") class="ion-close-round"> Not for me...  </a>' +
				'</div>';

			infowindow.setContent( $compile(content)($scope)[0] )
			infowindow.open(map, this);
		});
	}

		$scope.upvote = function(place){
		console.log('Upvote place', place);
		$http.post('/upvote', {place: place}).then(function(success){
			console.log('upvoted!');
		})
	}
	$scope.logout = function(){
		$http.get('/api/logout').then(function(success){
			// refreshing will bring the user to the login page
			location.href="/"
		});
	}

	$scope.downvote = function(place){
		console.log('Downvote place', place);
		$http.post('/downvote', {place: place}).then(function(success){
			console.log('downvoted!');
		})
	}

	$scope.recommend = function(){
		$http.get('/recommendations').then(function(response){
			console.log(response);
			var places = response.data.localplaces; 
			var recommendations = response.data.recommendations; 
			$scope.recs = {};
			if (places && places.length > 0){
	            for(i=0;i<places.length;i++){
					Place.createMarkerFromCustomPlace(map, places[i]);
				}
			}
			console.log(recommendations.length);
			if (recommendations.length>0){
				for(i=0;i<recommendations.length;i++){
					var id = recommendations[i];
					$scope.recs[id] = null;
					if(id.length > 6){
						// google id
				        service.getDetails({placeId: id}, function(place, status) {
				          if (status === google.maps.places.PlacesServiceStatus.OK) {
				            createMarker(place);
				            console.log('created marker for ', id, place.place_id );
				            console.log('which points to ', $scope.recs[place.place_id]	 );
				            $scope.recs[place.place_id] = place;
				            $scope.$apply();
				          }
				        });
						console.log(id + " is a google id, need to fetch place data");
					} else {
						// custom place id
						console.log(id + " is a local id, need to fetch place data");
						var place = null;
			            for(i=0;i<places.length;i++){
			            	if(places[i].id == id){
				            	place = places[i];
				            	break;
			            	}
			            }
						$scope.recs[place.id] = {
							place_id: place.id,
							types: [place.type],
							name: place.name,
							vicinity: place.address,
						}	
						console.log(recs);
						
					}
				}
			} else {
				$scope.noRecs=true;
			}
		});
	}


	createMarkerFromCustomPlace = function(customPlace){
		var location = new google.maps.LatLng(customPlace.lat, customPlace.long);
		var dist = google.maps.geometry.spherical.computeDistanceBetween(
			map.getCenter(),
			location);
		if (dist <= $scope.radius){
			Place.geocodePosition(customPlace, function(address){	
				createMarker({
					custom: true,
					place_id: customPlace.id,
					types: [customPlace.type],
					beaconRating: customPlace.beaconRating,
					name: customPlace.name,
					vicinity: address,
					geometry: {
						location: location
					}
				});	
			});
		}	
	}


	User.fetchLoggedInUser(function(user){
		console.log('init place  ctrl after fetching user')
		$scope.currentUser = user;
		initMap();
		Place.fetchPlaces(createMarkerFromCustomPlace);
	})


	// android style action / fab button in bottom right corner
	$actionButton.create({
	    mainAction: {
	      icon: 'ion-gear-b',
	      backgroundColor: 'blue',
	      textColor: ' white',
	      onClick: function() {
	        console.log('clicked main BUTTON');
	      }
	    },
	    buttons: [{
	      label: 'Logout',
	      backgroundColor: 'red',
	      iconColor: 'white',
	      onClick: function() {
	        console.log('clicked logout');
	        $location.path('/logout')
	      }
	    }, {
	      label: 'Settings',
	      onClick: function() {
	        console.log('clicked Settings');
	        $location.path('/user')
	      }
	    }, {
	      label: 'Recommendations',
	      onClick: function() {
	      	$scope.recommend();
	        console.log('clicked Recommendations');
			$ionicSideMenuDelegate.toggleRight();
	      }
	    }]
	});
}]);