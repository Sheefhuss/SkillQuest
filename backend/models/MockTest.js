const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MockTest = sequelize.define('MockTest', {
  user_email: {
    type: DataTypes.STRING,
  },
  track_slug: {
    type: DataTypes.STRING,
  },
  tier: {
    type: DataTypes.STRING,
  },
  questions: {
    type: DataTypes.JSON, 
  },
  score: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  total: {
    type: DataTypes.INTEGER,
    defaultValue: 15,
  },
  time_seconds: {
    type: DataTypes.INTEGER,
  }
});

module.exports = MockTest;