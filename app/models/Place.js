var Sequelize = require('sequelize');
sequelize = new Sequelize('mysql://mochacat:8b2z929v@beacon-1.coigew9zt5yh.eu-west-1.rds.amazonaws.com:3306/beacon');

// define our place model
// module.exports allows us to pass this to other files when it is called
var Place = sequelize.define('Place', {
	place_id : {type : Sequelize.STRING, default: ''},
	name : {type : Sequelize.STRING, default: ''},
	address : {type : Sequelize.STRING, default: ''},
	lat : {type : Sequelize.STRING, default: ''},
	lng : {type : Sequelize.STRING, default: ''},
	type : {type : Sequelize.STRING, default: ''}
});

console.log("defined custom places");

module.exports = Place;