// modules =================================================
var express        = require('express');
var app            = express();
var Sequelize      = require('sequelize');
var morgan         = require('morgan');
var session        = require('express-session');
var bodyParser     = require('body-parser');
var cookieParser   = require('cookie-parser');
var methodOverride = require('method-override');

var passport = require('passport');
var User = require('./app/models/User');
var Place = require('./app/models/Place');
var Ratings = require('./app/models/Rating');
var config = require('./config.js');
// configuration ===========================================
sequelize = new Sequelize('mysql://mochacat:8b2z929v@beacon-1.coigew9zt5yh.eu-west-1.rds.amazonaws.com:3306/beacon');
 //load the passport configuration
require('./config/passport')(passport);

// get all data/stuff of the body (POST) parameters and cookies
app.use(cookieParser());
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users

app.use(session({ secret: 'ivehadtoomuchcoffeetoday' })); // session secret
app.use(passport.initialize());
app.use(passport.session());
// enables debug logging
app.use(morgan('dev'));

console.log('Duck who?');
User.sync({}).then(function () {
    // Table created
    console.log('Duck you');
    return User;
});

// routes ==================================================
require('./app/routes')(app, passport); // pass our application and passport config into our routes
var port = process.env.PORT || 8080;

// start app ===============================================
app.listen(port, '0.0.0.0');	
console.log('Listening on port : ' + port); // shoutout to the user
module.exports = app; 						// expose app