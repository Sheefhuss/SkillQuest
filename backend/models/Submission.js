'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Submission = sequelize.define('Submission', {
  user_email: {
    type: DataTypes.STRING
  },
  challenge_id: {
    type: DataTypes.STRING
  },
  code: {
    type: DataTypes.TEXT
  },
  attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  passed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  time_taken_seconds: {
    type: DataTypes.INTEGER
  },
  xp_earned: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  ai_feedback: {
    type: DataTypes.TEXT
  }
});

module.exports = Submission;
