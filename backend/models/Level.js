const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Level = sequelize.define('Level', {
  track_slug: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  tier: {
    type: DataTypes.ENUM('Beginner', 'Intermediate', 'Advanced'),
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  summary: {
    type: DataTypes.TEXT,
  },
  video_url: {
    type: DataTypes.STRING,
  },
  reading_material: {
    type: DataTypes.TEXT,
  },
  quiz: {
    type: DataTypes.JSON,
  },
  challenge_prompt: {
    type: DataTypes.TEXT,
  },
  challenge_starter: {
    type: DataTypes.TEXT,
  },
  sample_input: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  sample_output: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  xp_reward: {
    type: DataTypes.INTEGER,
    defaultValue: 80,
  },
});

module.exports = Level;
