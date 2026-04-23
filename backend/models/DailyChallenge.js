'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DailyChallenge = sequelize.define('DailyChallenge', {
  date: {
    type: DataTypes.DATEONLY
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  difficulty: {
    type: DataTypes.STRING,
    defaultValue: 'Medium'
  },
  prompt: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  starter_code: {
    type: DataTypes.TEXT
  },
  expected_concepts: {
    type: DataTypes.JSON,
    get() {
      const val = this.getDataValue('expected_concepts');
      if (Array.isArray(val)) return val;
      if (typeof val === 'string') {
        try { return JSON.parse(val); } catch { return []; }
      }
      return [];
    }
  },
  is_weekly: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  xp_reward: {
    type: DataTypes.INTEGER,
    defaultValue: 50
  }
});

module.exports = DailyChallenge;
