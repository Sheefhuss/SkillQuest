const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PeerChallenge = sequelize.define('PeerChallenge', {
  challenger_email: {
    type: DataTypes.STRING,
  },
  challenger_name: {
    type: DataTypes.STRING,
  },
  opponent_email: {
    type: DataTypes.STRING,
  },
  opponent_name: {
    type: DataTypes.STRING,
  },
  problem_title: {
    type: DataTypes.STRING,
  },
  problem_prompt: {
    type: DataTypes.TEXT,
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'completed', 'declined'),
    defaultValue: 'pending',
  },
  winner_email: {
    type: DataTypes.STRING,
  },
  xp_stake: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
  }
});

module.exports = PeerChallenge;