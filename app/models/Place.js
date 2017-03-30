var Sequelize = require('sequelize');
sequelize = new Sequelize('mysql://root:63a283356d2003ba85f5ceb8fcfd2cE!@88.99.186.61:3306/beacon');

// define our place model
// module.exports allows us to pass this to other files when it is called
var Place = sequelize.define('Place', {
	name : {type : Sequelize.STRING, default: ''},
	address : {type : Sequelize.STRING, default: ''},
	lat : {type : Sequelize.DECIMAL(20,15)},
	long : {type : Sequelize.DECIMAL(20,15)},
	beaconRating : {type : Sequelize.DECIMAL(), default: 0},
	verified : {type : Sequelize.BOOLEAN, default: false},
	type : {type : Sequelize.STRING, default: ''},
	user : {type : Sequelize.STRING, default: ''},
	young_child : {type : Sequelize.BOOLEAN, default: false},
	older_child : {type : Sequelize.BOOLEAN, default: false},
	price_level : {type : Sequelize.STRING, default: '1'}
});

console.log("defined custom places");
// ensure the table exists
sequelize.sync()
module.exports = Place;