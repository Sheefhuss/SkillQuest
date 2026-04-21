const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Mission = sequelize.define('Mission', {
  user_email: {
    type: DataTypes.STRING,
  },
  week_start: {
    type: DataTypes.DATEONLY,
  },
  title: {
    type: DataTypes.STRING,
  },
  narrative: {
    type: DataTypes.TEXT,
  },
  objectives: {
    type: DataTypes.JSON, 
  },
  difficulty: {
    type: DataTypes.ENUM('Easy', 'Balanced', 'Challenging', 'Brutal'),
  },
  xp_reward: {
    type: DataTypes.INTEGER,
    defaultValue: 200,
  },
  badge_reward: {
    type: DataTypes.STRING,
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
});

module.exports = Mission;