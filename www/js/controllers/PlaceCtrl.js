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
	$scope.radius = 1000;
	$scope.markers =[];
	$scope.newUnsavedPlace = null;
	$scope.playgrounds =[];
	$scope.lat;
	$scope.long;
	$scope.activeTypes = [];
	$scope.myLocation;
	$scope.newPlace = {
		name: '',
		address: '',
		type: '',
		lat: 0,
		long: 0,
		user: null,
		price_level: 1,
		young_child: false,
		older_child: false
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
	$scope.maxprice = "1";
	
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
		console.log("typeFromSubType", subType, superTypes);
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

	function showUserLocationIfAvailable(){
		if(typeof navigator.geolocation != 'object') {
			console.log("navigator.geolocation isn't defined");
			$scope.myLocation = Place.userLocationToLatLong($scope.currentUser);
			return;
		}
		navigator.geolocation.getCurrentPosition(function(success){
			// console.log('getCurrentPosition');
			// console.log(success);

			$scope.myLocation = new google.maps.LatLng(
				success.coords.latitude,
				success.coords.longitude
			);

			if($scope.myMarker){
				$scope.myMarker.setMap(null)
			}

			$scope.myMarker = new Marker({
				map: map,
				position: $scope.myLocation,
				icon: {
					path: SQUARE_PIN,
					fillColor: 'black',
					fillOpacity: 0,
					strokeColor: '',
					strokeWeight: 0
				},
				map_icon_label: '<span class="myMarker">'+
									'<span class="map-icon icon ion-ios-body">' +
									'</span>' +
									'<span class="me"> me </span>' +
								'</span>'
			});
			//Update every 5 secs
			setTimeout(showUserLocationIfAvailable,5000)
		});
		
	}

	function initMap() {
		$scope.initCenter = Place.userLocationToLatLong($scope.currentUser);
		var mapElement = document.getElementById('map');
		if(mapElement == null){
			return ;
		}
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
		//Add place on double click
		google.maps.event.addListener(map, 'dblclick', function(event){
			if($scope.newUnsavedPlace != null) {
				$scope.newUnsavedPlace.setMap(null);
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

	$scope.update = function(){
		console.log('updating');
		for(var q = 0; q<$scope.activeTypes.length; q++){
			var type = $scope.activeTypes[q]
			hidePlacesOfType(type);
			showPlacesOfType(type);
			console.log('updating', type);
		}
		
	};

	$scope.isActive = function(type){
		return $scope.activeTypes.indexOf(type) > -1;
	}

	function showPlacesOfType(type){
		$scope.activeTypes.push(type);
		var sType = $scope[type];
		map.setCenter($scope.myLocation);
		for(var x=0; x<sType.length; x++){
			subtype = sType[x];
		    var maxprice = parseInt($scope.maxprice);
			
			// console.log('searching places');
			Place.searchPlaces(createMarkerFromCustomPlace, type, maxprice);
			service.nearbySearch({
				location: $scope.myLocation,
				radius: $scope.radius,
				maxPriceLevel: maxprice,
				type: [subtype],
			}, searchCallback.bind(type));
		}
	}

	function hidePlacesOfType(type){
		var index = $scope.activeTypes.indexOf(type);
		$scope.activeTypes.splice(index,1);
		var sType = $scope[type];
		
		for(var i = 0; i< markers.length; i++){
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
		console.log("place " + place.place_id + " has type " + place.type);
		var type = place.type;
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
		var price;

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
					'<p> Price Level: ' + place.price_level + '</p>' + 
					'<p> Suitable for young kids: ' + place.young_child + '</p>' + 
					'<p> Suitable for older kids: ' + place.older_child + '</p>' + 
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
			$scope.liked = true;
			$scope.disliked = false;
			$http.post(SERVER_ROOT + 'upvote', {place: place}).then(function(success){
				console.log('upvoted!');
			})
	};

	$scope.downvote = function(place){
		console.log('Downvote place', place);
		$scope.liked = false;
		$scope.disliked = true;
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
							young_child: place.young_child,
							older_child: place.older_child,
							price_level: place.price_level
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
		console.log("createMarkerFromCustomPlace",customPlace);
		var location = new google.maps.LatLng(customPlace.lat, customPlace.long);
		var dist = google.maps.geometry.spherical.computeDistanceBetween(map.getCenter(),location);
		if (dist <= $scope.radius){
			Place.geocodePosition(customPlace, function(address){	
				console.log("creating custom place",customPlace);
				createMarker({
					custom: true,
					place_id: customPlace.id,
					types: [customPlace.type],
					type: typeFromSubType(customPlace.type),
					beaconRating: customPlace.beaconRating,
					name: customPlace.name,
					vicinity: address,
					young_child: customPlace.young_child,
					older_child: customPlace.older_child,
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
		showUserLocationIfAvailable();
		$scope.maxprice = $scope.currentUser.budget;
		// Place.fetchPlaces(createMarkerFromCustomPlace);
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