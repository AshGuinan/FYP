module.exports = function(app, passport, raccoon) {
    var User = require('./models/User');
    var Place = require('./models/Place');
    //var raccoon = require('raccoon');

	// server routes ===========================================================
	// handle things like api calls
	// authentication routes
	app.all("*", function(req,res,next){
		next()
	});
	// frontend routes =========================================================
	// route to handle all angular requests
    app.post('/sign-up',
		passport.authenticate('local-signup', {
			successRedirect : '/', // redirect to the secure profile section
			failureRedirect : '/fail' // redirect back to the signup page if there is an error
		})
	);

	app.post('/login',
		passport.authenticate('local-login', { failureRedirect: '/fail' }),
		function(req, res) {
			res.redirect('/places');
            console.log('User: '+req.user.userName);
		});   

    app.get('/api/logout',
        function(req, res){
            req.logOut();
            res.clearCookie('connect.sid', {expires: new Date()});
            req.session.destroy(function (err) {
                console.log('logged out');
                res.send(200);
            });
        });

    app.get('/api/places', isLoggedIn, function(req, res) {
        res.sendfile('./public/views/place.html');
    });

    app.get('/api/recommend', isLoggedIn, function(req, res) {
        res.sendfile('./public/views/recommend.html');
    });

    app.get('/api/user', userPage, function(req, res) {
        console.log('User page loading');
    });

    app.get('/api/frontPage', frontPage, function(req, res) {
        console.log('Front page loading');
    });

    app.get('/me', isLoggedIn, function(req, res) {
        res.send(req.user);
    });


    //TODO: Lock down voting, unlike, undislike

    app.post('/upvote', isLoggedIn, function(req, res) {
        var voted = false;
        console.log('upvote called!')
        raccoon.allWatchedFor(req.user.userName).then((results) => {
              // returns an array of all the items that user has liked or disliked.
              for(var x=0; x<results.length; x++){
                if(req.body.place==results[x]){
                    console.log('Already voted');
                    voted = true;
                    raccoon.unliked(req.user.userName, req.body.place).then(() => {
                        console.log('like undone!');
                    });
                }
              }
            }).then(()=>{
                if(voted==false){
                    raccoon.liked(req.user.userName, req.body.place).then(() => {
                        console.log('Upvote confirmed!');
                        //Check id not already liked by user - racoon?
                        if(req.body.place.length > 6){
                            // it's a google id, nothing to increment here 
                            res.send({incremented: true});
                        } else {
                            Place.findById(req.body.place).then(function(place){
                                if(place){
                                    console.log("The place had id " + req.body.place + " and we found " + place.name)
                                    place.increment({beaconRating: 1}).then(function(){
                                        console.log('incremented places rating in db')
                                        res.send({incremented: true});
                                    });
                                } else {
                                    res.send({incremented: true});    
                                }
                            });
                        }
                    });
                }
                
            });
        
    });

    app.post('/downvote', isLoggedIn, function(req, res) {
        raccoon.disliked(req.user.userName, req.body.place).then(() => {
            console.log('Downvoted...');
            if(req.body.place.length > 6){
                // it's a google id, nothing to increment here 
                res.send({decremented: true});
            }
            else{
                Place.findById(req.body.place).then(function(place){
                    if(place) {
                        console.log("The place had id " + req.body.place + " and we found " + place.name)
                        place.decrement({beaconRating: 1}).then(function(){
                            console.log('decremented places rating in db')
                            res.send({decremented: true});
                        });
                    } else {
                        res.send({incremented: true});    
                    }
                });
            }
        });
    });

    app.get('/fetchPlaces', isLoggedIn, function(req, res) {
        console.log("fetch places where user is", req.user.userName);
        Place.findAll({ 
            where: { 
                //user: req.user.userName
                $or: [{user: req.user.userName}, {verified: true}]
            }
        })
        .then(function(data){
            res.send(data);
        });
    });

    app.get('/fetchAllPlaces', isLoggedIn, function(req, res) {
        Place.findAll().then(function(data){
            res.send(data);
        });
    });

    app.get('/recommendations', isLoggedIn, function(req, res) {
        console.log(req.user.userName);
        raccoon.recommendFor(req.user.userName, 5).then((results) => {
            console.log('results: ');
            console.log(results);
            console.log('username: ');
            console.log(req.user.userName);
           Place.findAll({ where: { id: results } }).then(function (places) {
                var response = {
                    recommendations:results,
                    localplaces:places
                };
                console.log('results: ');
                console.log(places);
                res.send(response);
            });
        });
    });

    app.get('/top', isLoggedIn, function(req, res) {
            var topPlaces = [];
            raccoon.bestRated().then((results) => {
                Place.findAll({ where: { id: results } }).then(function (place) {
                    res.send(place);
                });
            });
        });

    app.post('/updateDetails', isLoggedIn, function(req, res){
        console.log('updateDetails')
        console.log(req.body)
        console.log(req.user.userName,req.user.id)
        //only update 
        updatedUserData = {

        }
        req.user.updateAttributes({
            budget: req.body.budget,
            numChildren: req.body.numChildren,
            ageChildren: req.body.ageChildren,
            activityType: req.body.activityType,
            location: req.body.location 
        }).then(function () {
            res.redirect('/places');
        })
    });

    app.post('/updateLoc', isLoggedIn, function(req, res){
        req.user.updateAttributes({
            location: req.body.location
        }).then(function () {
            res.redirect('/places');
        })
    });

    app.post('/verify', isAdmin, function(req, res){
        Place.find({ where: { id: req.body.placeId } }).then(function (place) {
            if (place) {
                console.log('place has been verified');
                place.updateAttributes({
                    verified: true,
                })
            }
        });
    });

    app.post('/addPlace', isLoggedIn, function(req, res){
        console.log(req);
        var name = req.body.name.toLowerCase();
        var lat1 = parseFloat(req.body.lat);
        var long1 = parseFloat(req.body.long);
        Place.find({where:{ 'name' :  name }}).then(function(place){
            if (place != null) {
                res.send(place);
            } else {
                data = {
                    name: name,
                    address: req.body.address,
                    lat: lat1,
                    long: long1,
                    type: req.body.type,
                    verified: false,
                    beaconRating: 0,
                    user: req.user.userName,
                    price_level: req.body.price_level
                }
                console.log(data);
                Place.create(data).then(function(place){
                    console.log("created a new place!");
                    res.send(place);
                });
            }
        });
    });


    function isLoggedIn(req, res, next) {
        // if user is authenticated in the session, carry on
        if (req.isAuthenticated()){
            console.log("\n logged in !!!")
            return next();
        }
        else {
            // if they aren't redirect them to the home page
            res.sendfile('./public/views/user.html');
            console.log('not logged in');
        }
    }

    function isAdmin(req, res, next) {
        // if user is authenticated in the session, carry on
        if (req.user.verified==true){
            console.log('Welcome admin!');
            return next();
        }

        // if they aren't redirect them to the home page
        res.sendfile('./public/views/fail.html');
        console.log('Nope, Access Denied');
    }

    //For profile page
    function userPage(req, res, next) {

        // if user is authenticated in the session, carry on
        if (req.isAuthenticated()){
            console.log('Logged in - edit your profile!');
            res.sendfile('./public/views/profile.html');

        } else{
            console.log('Sign in!');
            res.sendfile('./public/views/user.html');
        }
    }

    function frontPage(req, res, next) {
        // if user is authenticated in the session, carry on
        if (req.isAuthenticated()){
            console.log('Logged in - Hello!');
            res.sendfile('./public/views/home.html');

        } else{
            console.log('Sign in!');
            res.sendfile('./public/views/user.html');
        }
    }

    app.get('*', function(req, res) {
		res.sendfile('./public/index.html');
	});
};