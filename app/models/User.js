var Sequelize = require('sequelize');
var DataTypes = require('sequelize/lib/data-types');
var bcrypt = require("bcrypt-nodejs");
sequelize = new Sequelize('mysql://root:63a283356d2003ba85f5ceb8fcfd2cE!@88.99.186.61:3306/beacon');

console.log("about to define the user");

var User = sequelize.define('User', {
    userName: {
        type: DataTypes.STRING
    },
    password: {
        type: DataTypes.STRING
    },
    score: {
        type: DataTypes.STRING
    },
    verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    budget: {
        type : Sequelize.INTEGER, 
        default: 1
    },
    young_child : {
        type : Sequelize.BOOLEAN, 
        default: false
    },
    older_child : {
        type : Sequelize.BOOLEAN, 
        default: false
    },
    activityType: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "education"
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Galway"
    }
},{
    setterMethods: {
      password: function(rawPassword){
          var hashedPassword = bcrypt.hashSync(rawPassword, bcrypt.genSaltSync(8), null);
          this.setDataValue('password', hashedPassword);
      }
    },
    freezeTableName: true,
    instanceMethods: {
        validPassword: function(password) {
            return bcrypt.compareSync(password, this.password);
        }
    }
});
console.log("defined the user");
// ensure the table exists
sequelize.sync()
module.exports = User;