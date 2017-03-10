module.exports = function(app, passport) {
    var User = require('./models/User');
	// server routes ===========================================================
	// handle things like api calls
	// authentication routes
	app.all("*", function(req,res,next){
		console.log("New Request:");
		console.log(req.body);
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

	console.log("routes are setup");

    app.get('/me', isLoggedIn, function(req, res) {
        var data = {
            name: req.user.userName
        };
        res.send(data);
    });

    app.post('/updateDetails',
        function(req, res){
            // console.log(req.body.userName);
            //console.log(req.userName.userName);
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

    app.get('*', function(req, res) {
		res.sendfile('./public/index.html');
	});
};