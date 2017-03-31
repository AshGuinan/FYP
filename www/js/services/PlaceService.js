angular
	.module('PlaceService', [])
	.factory('Place', ['$http', function($http) {
	var Place = {};
	Place.locations = {
		Galway: new google.maps.LatLng(53.272931, -9.0631102),
		Dublin: new google.maps.LatLng(53.3484285,-6.2569559),
		Cork: new google.maps.LatLng(51.8983147,-8.4822781),
		Limerick: new google.maps.LatLng(52.6676852,-8.6366651)
	}; 
	var geocoder = new google.maps.Geocoder();

	// return latlng object for users perfered location
	//   if invalid, default is Galway
	Place.userLocationToLatLong = function(user){
		var location = this.locations.Galway;
		if(user && user.location)
			location = this.locations[user.location];
		return  location;
	}

	Place.fetchPlaces = function(callback){	
		$http.get(SERVER_ROOT + 'fetchPlaces').then(
			function (data){
				console.log('fetched ', data)
				var places = data.data;
				for(i=0;i<places.length;i++){
	        		callback(places[i]);
	            }
			},function (error){
				console.log(error);
		});
	};

	Place.fetchAllPlaces = function(callback){
		$http.get(SERVER_ROOT + 'fetchAllPlaces').then(
			function (data){
				var places = data.data;
	            for(i=0;i<places.length;i++){
	        		callback(places[i]);
	            }		
	        },
	        function (error){
				console.log('Fail');
			});
	}

	Place.addPlace = function(newPlace,callback){
		$http.post(SERVER_ROOT + 'addPlace', newPlace).then(
			function(success){
				console.log('added place', success)
				callback(success.data);
			},function(error){
				console.log('error', error)
		});
	};	

	Place.geocodePosition = function(customPlace, callback) {
		var loc = new google.maps.LatLng(
			customPlace.lat, 
			customPlace.long);
	  	geocoder.geocode({
			latLng: loc
		}, function(responses) {
			var address = ' ';
			if (responses && responses.length > 0) {
		    	address = responses[0].formatted_address;
			};
			callback(address);
		});
	};

	Place.fetchInfoForGooglePlace = function(id, callback){
		service.getDetails({placeId: id}, function(place, status) {
				          if (status === google.maps.places.PlacesServiceStatus.OK) {
				            createMarker(place);
				            console.log('created marker for ', id, place.place_id );
				            console.log('which points to ', parsedRecommendations[place.place_id]	 );
				            parsedRecommendations[place.place_id] = place;
				          }
				        });
	}

	
	return Place;
}]);