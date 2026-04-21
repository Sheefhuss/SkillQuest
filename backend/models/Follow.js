const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Follow = sequelize.define('Follow', {
  follower_email: {
    type: DataTypes.STRING,
    allowNull: false, 
  },
  following_email: {
    type: DataTypes.STRING,
    allowNull: false,
  }
});

module.exports = Follow;