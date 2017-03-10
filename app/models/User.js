var Sequelize = require('sequelize');
var DataTypes = require('sequelize/lib/data-types');
var bcrypt = require("bcrypt-nodejs");
var config = require('../../config.js');
sequelize = new Sequelize('mysql://mochacat:8b2z929v@beacon-1.coigew9zt5yh.eu-west-1.rds.amazonaws.com:3306/beacon');

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
        type: DataTypes.STRING
    },
    budget: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "fuck"
    },
    numChildren: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 0
    },
    ageChildren: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 5
    },
    activityType: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "fun"
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

module.exports = User;