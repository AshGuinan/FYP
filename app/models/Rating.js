var Sequelize = require('sequelize');

// define our place model
// module.exports allows us to pass this to other files when it is called
var Rating = sequelize.define('Rating', {
	rating_id : {type : Sequelize.STRING, default: ''},
	place_id : {type : Sequelize.STRING, default: ''},
	rating : {type : Sequelize.STRING, default: ''},
	date : {type : Sequelize.STRING, default: ''},
	user_id : {type : Sequelize.STRING, default: ''},
});

console.log("defined custom places");

module.exports = Rating;