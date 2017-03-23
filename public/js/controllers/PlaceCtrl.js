angular.module('PlaceCtrl',['ionic', '$actionButton']).controller('PlaceController', ['$scope', '$http', '$compile', '$actionButton', function($scope, $http, $compile, $actionButton) {
	console.log(arguments);
	var map;
	var markers = [];
	var newPlace;
	var nPData = new google.maps.InfoWindow();
	var service;
	var Galway = new google.maps.LatLng(53.272931, -9.0631102);
	var Dublin = new google.maps.LatLng(53.3484285,-6.2569559);
	var Cork = new google.maps.LatLng(51.8983147,-8.4822781);
	var Limerick = new google.maps.LatLng(52.6676852,-8.6366651);
	var geocoder= new google.maps.Geocoder();
	window.text = $scope
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
	$scope.noRecs = false;
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
		console.log($scope.currentUser.location);
		switch($scope.currentUser.location){
			case "Galway":
				$scope.initCenter = Galway;
				break;
			case "Cork":
				$scope.initCenter = Cork
				break;
			case "Dublin":
				$scope.initCenter = Dublin
				break;
			case "Limerick":
				$scope.initCenter = Limerick
				break;
		}
		map = new google.maps.Map(document.getElementById('map'), {
			center: $scope.initCenter,
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
			console.log(type);
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
		$http.get('/recommendations').then(function(response){
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
					$scope.recs[id] = null
					if(id.length > 6){
						// google id
				        service.getDetails({placeId: id}, function(place, status) {
				          if (status === google.maps.places.PlacesServiceStatus.OK) {
				            createMarker(place);
				            console.log('created marker for ', id, place.place_id )
				            console.log('which points to ', $scope.recs[place.place_id] )
				            $scope.recs[place.place_id] = place;
				            $scope.$apply();
				          }
				        });
						console.log(id + " is a google id, need to fetch place data");
					} else {
						// custom place id
						console.log(id + " is a local id, need to fetch place data");
						var place = null
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

	function callback(results, status, pagination) {
		var type = this.toString();
		console.log("trggering callback for place of type: ",type);
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
		if ($.inArray(place.types[0], $scope.education) > -1){
			console.log('education');
		}
		if ($.inArray(place.types[0], $scope.indoorFun) > -1){
			console.log('indoorFun');
		}
		if ($.inArray(place.types[0], $scope.outdoors) > -1){
			console.log('outdoorFun');
		}
		if ($.inArray(place.types[0], $scope.ICE) > -1){
			console.log('ICE');
		}
		if ($.inArray(place.types[0], $scope.culture) > -1){
			console.log('culture');
		}
		if ($.inArray(place.types[0], $scope.goodToKnow) > -1){
			console.log('goodToKnow');
		}

		var marker = new google.maps.Marker({
			map: map,
			position: place.geometry.location,
			map_icon_label: '<span class="map-icon map-icon-point-of-interest"></span>'
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
			placeRating = "Google Rating: " + place.rating + "Stars";
		}
		console.log(place);
		console.log('place')

		google.maps.event.addListener(marker, 'click', function() {
			content = 
				'<div>'+
					'<h3>' + place.name + '</h3>'+ 
					'<p> Type: ' +  type + '</p>' +
					'<p> This Address: ' +  $scope.custAddress + '</p>' +
					'<p>' + placeRating + '</p>' +
					'<p> Price Level' + place.price_level + '</p>' + 
					'<a ng-click=upvote("' + place.place_id + '")> I liked it! </a>' +
					'<a ng-click=downvote("' + place.place_id + '")> Not for me...  </a>' +
				'</div>';

			infowindow.setContent( $compile(content)($scope)[0] )
			infowindow.open(map, this);
		});
	}

	function createMarkerFromCustomPlace(customPlace){
		console.log("adding custom place:", customPlace)
		var loc = new google.maps.LatLng(customPlace.lat, customPlace.long);
		var dist = google.maps.geometry.spherical.computeDistanceBetween(map.getCenter(),loc);
		$scope.custAddress = customPlace.address;
		geocodePosition(loc);
		if (dist<=$scope.radius){
			createMarker({
				custom: true,
				place_id: customPlace.id,
				types: [customPlace.type],
				beaconRating: customPlace.beaconRating,
				name: customPlace.name,
				vicinity: $scope.custAddress,
				geometry: {
					location: loc
				},
				map_icon_label: '<span class="map-icon map-icon-point-of-interest"></span>'
			});	
		}	
	}

function geocodePosition(pos) {
  geocoder.geocode({
		latLng: pos
	}, function(responses) {
		if (responses && responses.length > 0) {
	    	console.log(responses);
	    	console.log('a-ok');
	    	$scope.custAddress = responses[0].formatted_address;
	    	console.log($scope.custAddress);
		} else {
		    $scope.custAddress = 'Error here';
		    console.log('heuston has a problem');
		}
	});
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
	console.log("$actionButton", $actionButton);
	$actionButton.create({
	    mainAction: {
	      icon: 'ion-android-create',
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
	      }
	    }, {
	      label: 'Settings',
	      onClick: function() {
	        console.log('clicked Settings');
	      }
	    }, {
	      label: 'Recommendations',
	      onClick: function() {
	        console.log('clicked Recommendations');
	      }
	    }]
	  });
	  
}]);