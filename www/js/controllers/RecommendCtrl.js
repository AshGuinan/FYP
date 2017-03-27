angular
	.module('RecommendCtrl', [])
	.controller('RecommendController', ['$scope','$http', '$compile','$location','Place', 'User',
			function($scope, $http, $compile, $location, $actionButton, Place, User) { 
	console.log('loaded recommend Ctrl');

	
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


}]);