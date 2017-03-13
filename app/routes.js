module.exports = function(app, passport) {
    var User = require('./models/User');
    var Place = require('./models/Place');

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
			res.redirect('/');
            console.log('User: '+req.user.userName);
		});

    app.get('/logout',
        function(req, res){
            console.log('is user authenticated? ' + req.isAuthenticated());
            console.log('cookies ' + JSON.stringify(req.cookies));
            req.logout();
            res.clearCookie('connect.sid', {expires: new Date(0)});
            console.log('Logging out');
            res.sendfile('./public/views/logout.html');
            console.log('is user authenticated? ' + req.isAuthenticated());
        });

	app.get('/places', isLoggedIn, function(req, res) {
        console.log('You are now logged in!');
        res.sendfile('./public/views/place.html');
	});

    app.get('/user', userPage, function(req, res) {
        console.log('User page loading');
        // res.sendfile('./public/views/user.html');
    });

    app.get('/frontPage', frontPage, function(req, res) {
        console.log('Front page loading');
        // res.sendfile('./public/views/user.html');
    });

	console.log("routes are setup");

    app.get('/me', isLoggedIn, function(req, res) {
        var data = {
            name: req.user.userName
        };
        res.send(data);
    });

    app.get('/fetchPlaces', isLoggedIn, function(req, res) {
        console.log("fetch places where user is", req.user.userName);
        Place.findAll({ 
            where: { 
                user: req.user.userName
                    }
            })
        .then(function(data){
            res.send(data);
        });
    });

    app.post('/updateDetails', function(req, res){
        User.find({ where: { userName: req.body.userName } })
        .on('success', function () {
            if (User) {
                User.updateAttributes({
                    budget: req.body.budget,
                     numChildren: req.body.numChildren,
                     ageChildren: req.body.ageChildren,
                    activityType: req.body.activityType
                })
                .success(function () {
                        console.log('Tah-Dah');
                        res.redirect('/');
                })
            }
        })
    });

    app.post('/addPlace', isLoggedIn, function(req, res){
        var name = req.body.name.toLowerCase();
        var lat1 = parseFloat(req.body.lat);
        var long1 = parseFloat(req.body.long);
        console.log('add Place called!');
        Place.find({where:{ 'name' :  name }}).then(function(place){
            if (place != null) {
                console.log('{Place already exists}');
                res.send(place);
            } else {
                data = {
                    name: name,
                    address: req.body.address,
                    lat: lat1,
                    long: long1,
                    type: req.body.type,
                    verified: req.body.verified,
                    user: req.body.user,
                    price_level: req.body.price_level
                }
                console.log("no existing place with this name found, creating a new place with data:")
                console.log(data);
                Place.create(data).then(function(place){
                    console.log("created a new place!", place);
                    res.send(place);
                });
            }
        });
    });


    function isLoggedIn(req, res, next) {

        // if user is authenticated in the session, carry on
        if (req.isAuthenticated()){
            return next();
        }

        // if they aren't redirect them to the home page
        res.sendfile('./public/views/fail.html');
        console.log('are you logged in?');
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
            return next();

        } else{
            console.log('Sign in!');
            res.sendfile('./public/views/user.html');
        }
    }

    app.get('*', function(req, res) {
		res.sendfile('./public/index.html');
	});
};