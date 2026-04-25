const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  display_name: {
    type: DataTypes.STRING,
  },
  bio: {
    type: DataTypes.TEXT,
  },
  xp: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  level_tier: {
    type: DataTypes.STRING,
    defaultValue: 'Rookie',
  },
  problems_solved: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  completed_levels: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  solved_levels: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  badges: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  streak_days: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  activity_log: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  last_active_date: {
    type: DataTypes.STRING,
  },
  is_pro: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  ai_tutor_uses_today: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  ai_tutor_date: {
    type: DataTypes.STRING,
    defaultValue: null,
  },
});

module.exports = User;
