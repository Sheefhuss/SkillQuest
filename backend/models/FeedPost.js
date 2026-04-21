const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FeedPost = sequelize.define('FeedPost', {
  user_email: {
    type: DataTypes.STRING,
  },
  user_name: {
    type: DataTypes.STRING,
  },
  user_avatar: {
    type: DataTypes.STRING,
  },
  kind: {
    type: DataTypes.ENUM('badge', 'level_up', 'challenge', 'streak', 'mission'),
  },
  title: {
    type: DataTypes.STRING,
  },
  detail: {
    type: DataTypes.STRING,
  },
  xp_gained: {
    type: DataTypes.INTEGER, 
  }
});

module.exports = FeedPost;