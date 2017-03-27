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
	$scope.radius = 2000;
	$scope.markers =[];
	$scope.newUnsavedPlace = null;
	$scope.playgrounds =[];
	$scope.lat;
	$scope.long;
	$scope.activeTypes = [];
	$scope.newPlace = {
		name: '',
		address: '',
		type: '',
		lat: 0,
		long: 0,
		user: null
	};

	var superTypes = ['education', 'indoorFun', 'food', 'outdoors', 
		'culture', 'goodtoKnow', 'ICE'];
	$scope.education = ['aquarium', 'book_store','museum'];
	$scope.indoorFun = ['bowling_alley','museum', 'aquarium'];
	$scope.food = ['bakery', 'cafe','restaurant'];
	$scope.outdoors = ['amusement_park', 'park','zoo'];
	$scope.culture = ['art_gallery', 'library'];
	$scope.goodToKnow = ['bank', 'gas_station', 'taxi_stand', 'train_station', 'post_office', 'pharmacy'];
	$scope.ICE = ['police', 'hospital', 'doctor', 'embassy', 'car_repair'];
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

	function typeFromSubType(subType){
		for(var i = 0; i < superTypes.length; i++){
			var superType = superTypes[i]
			if($scope[superType].indexOf(subType) != -1){
				return superType;
			}
		}
		return null;
	};
	function typeFromSubTypes(subTypes){
		for(var i = 0; i < subTypes.length; i++){
			var type = typeFromSubType(subTypes[i]);
			if(type != null){
				return type
			}
		}
		return null
	};

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
		
		google.maps.event.addListener(map, 'dblclick', function(event){
			if($scope.newUnsavedPlace != null) {
				$scope.newUnsavedPlace.setMap(null)
			}

			$scope.newUnsavedPlace = new google.maps.Marker({
	            position: event.latLng,
	            map: map
          	});
			map.setCenter(event.latLng);

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
		$ionicSideMenuDelegate.toggleRight();
	};

	$scope.search = function(input){
		if($scope.activeTypes.indexOf(input) == -1){
			showPlacesOfType(input);		
		} else {
			hidePlacesOfType(input);
		}
	};

	$scope.isActive = function(type){
		return $scope.activeTypes.indexOf(type) > -1;
	}

	showPlacesOfType = function(type){
		$scope.activeTypes.push(type);
		var sType = $scope[type];
		for(var x=0; x<sType.length; x++){
			subtype = sType[x]
			console.log(subtype);
			service.nearbySearch({
				location: map.getCenter(),
				radius: $scope.radius,
				type: [subtype],
			}, searchCallback.bind(type));
		}		
	}

	hidePlacesOfType = function(type){
		var index = $scope.activeTypes.indexOf(type);
		$scope.activeTypes.splice(index,1);
		var sType = $scope[type];
		
		for(var i =0; i< markers.length; i++){
			var marker = markers[i];
			if(marker.place.type == type){
				marker.setMap(null)
			}
		} 
		// loop over places and hide those which match the type
	}

	$scope.addPlace = function(){
		Place.addPlace($scope.newPlace, function(place){
			createMarkerFromCustomPlace(place);
			resetNewPlaceForm()			
			if($scope.newUnsavedPlace != null) {
				$scope.newUnsavedPlace.setMap(null)
			}
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
				results[i].type = type;
				createMarker(results[i]);
			}
		}
		if (pagination.hasNextPage) {
			console.log('loading next page of results for radius' + $scope.radius);
			pagination.nextPage();
		} 
	}

	function createMarker(place) {
		console.log("place " + place.place_id + " has type " + place.type)
		var type = (place.types[0]).replace("_"," ");
		var iconLabel = '';	
		switch(place.type){
			case 'education':
				iconLabel = 'ion-university';
				break;
			case 'outdoors':
				iconLabel = 'ion-leaf';
				break;
			case 'indoorFun':
				iconLabel = 'ion-happy';
				break;
			case 'food':
				iconLabel = 'ion-fork';
				break;
			case 'culture':
				iconLabel = 'ion-paintbrush';
				break;
			case 'goodToKnow':
				iconLabel = 'ion-information-circled';
				break;
			case 'ICE':
				iconLabel = 'ion-help-buoy';
				break;

		}
		if(place.recommended){
			iconLabel += " recommended";
		}
		console.log(iconLabel);
		var marker = new Marker({
			map: map,
			position: place.geometry.location,
			icon: {
				path: SQUARE_PIN,
				fillColor: 'black',
				fillOpacity: 0,
				strokeColor: '',
				strokeWeight: 0
			},
			map_icon_label: '<span class="map-icon icon ' + iconLabel + '"></span>'
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
		lat = place.geometry.location.lat();
		long = place.geometry.location.lng();
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
					// '<a href="geo:'+lat+','+long+'?q='+lat+','+long+'('+place.name+')") class="ion-ios-navigate"> Take me there! </a>' +
				'</div>';

			infowindow.setContent( $compile(content)($scope)[0] )
			infowindow.open(map, this);
		});
	}

		$scope.upvote = function(place){
		console.log('Upvote place', place);
		$http.post(SERVER_ROOT + 'upvote', {place: place}).then(function(success){
			console.log('upvoted!');
		})
	};

	$scope.downvote = function(place){
		console.log('Downvote place', place);
		$http.post(SERVER_ROOT + 'downvote', {place: place}).then(function(success){
			console.log('downvoted!');
		})
	}

	$scope.recommend = function(){
		$http.get(SERVER_ROOT + 'recommendations').then(function(response){
			console.log(response);
			var places = response.data.localplaces; 
			var recommendations = response.data.recommendations; 
			$scope.recs = {};
			if (places && places.length > 0){
	            for(i=0;i<places.length;i++){
					createMarkerFromCustomPlace(places[i]);
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
				            place.recommended = true;
				            place.type = typeFromSubTypes(place.types)
				            console.log(place)
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
			            place.recommended = true;
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
	};


	createMarkerFromCustomPlace = function(customPlace){
		var location = new google.maps.LatLng(customPlace.lat, customPlace.long);
		var dist = google.maps.geometry.spherical.computeDistanceBetween(
			map.getCenter(),
			location);
		if (dist <= $scope.radius){
			console.log(typeFromSubType(customPlace.type));
			Place.geocodePosition(customPlace, function(address){	
				createMarker({
					custom: true,
					place_id: customPlace.id,
					types: [customPlace.type],
					type: typeFromSubType(customPlace.type),
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
		if(user == null){
			return $location.path('/')
		}
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
			User.logout();
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