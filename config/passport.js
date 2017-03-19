var LocalStrategy = require('passport-local').Strategy;
var User = require('../app/models/User');
// var FacebookStrategy = require('passport-facebook').Strategy;
var configAuth = require('../config/auth');


module.exports = function(passport){
    console.log("passport config loaded");

    passport.serializeUser(function(user, cb) {
        console.log("serializeUser", user.id);
        cb(null, user.id);
    });

    passport.deserializeUser(function(id, cb) {
        console.log("deserializeUser", id);
        User.findById(id).then(function (user) {
            // if (err) { return cb(err); }
            console.log("deserializeUser Found");
            cb(null, user);
        });
    });

    passport.use('local-signup', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'userName',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, userName, password, done) { // callback with userName and password from our form
            console.log('Duck me');
            // find a user whose userName is the same as the forms userName
            // we are checking to see if the user trying to login already exists
            User.findOne({where:{ 'userName' :  userName }}).then(function(user){
                console.log('Duck you again');
                if (user) {
                    console.log('Duck the user '+user.userName);
                    return done(null, false);
                } else {
                    console.log('Duck the new user here');
                    //console.log(userName + password +budget +numChildren +ageChildren +activityType);
                    User.create({
                        userName: userName, password: password
                    }).then(function(user){
                        console.log("created a new user!", user);
                        return done(null, user);
                    });
                }
            });
        }));

    passport.use('local-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'userName',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, userName, password, done) { // callback with userName and password from our form

            // find a user whose userName is the same as the forms userName
            // we are checking to see if the user trying to login already exists
            User.findOne({ where: { 'userName' :  userName }}).then(function(user){
                // if no user is found, return the message
                if (!user){
                    console.log('user not found');
                    return done(null, false);
                }

                // if the user is found but the password is wrong
                if (!user.validPassword(password)){
                    console.log('Password error');
                    console.log(password);
                    return done(null, false); // create the loginMessage and save it to session as flashdata
                }

                // all is well, return successful user
                return done(null, user);
            });

        }));
};