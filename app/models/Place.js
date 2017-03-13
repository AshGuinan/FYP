var Sequelize = require('sequelize');
sequelize = new Sequelize('mysql://mochacat:8b2z929v@beacon-1.coigew9zt5yh.eu-west-1.rds.amazonaws.com:3306/beacon');

// define our place model
// module.exports allows us to pass this to other files when it is called
var Place = sequelize.define('Place', {
	name : {type : Sequelize.STRING, default: ''},
	address : {type : Sequelize.STRING, default: ''},
	lat : {type : Sequelize.DECIMAL(20,15)},
	long : {type : Sequelize.DECIMAL(20,15)},
	verified : {type : Sequelize.BOOLEAN, default: 0},
	type : {type : Sequelize.STRING, default: ''},
	user : {type : Sequelize.STRING, default: ''},
	price_level : {type : Sequelize.STRING, default: 'medium'}
});

console.log("defined custom places");
// ensure the table exists
sequelize.sync()
module.exports = Place;