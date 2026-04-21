const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DailyChallenge = sequelize.define('DailyChallenge', {
  date: {
    type: DataTypes.DATEONLY, 
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false, 
  },
  difficulty: {
    type: DataTypes.ENUM('Easy', 'Medium', 'Hard', 'Insane'),
  },
  prompt: {
    type: DataTypes.TEXT, 
    allowNull: false, 
  },
  starter_code: {
    type: DataTypes.TEXT, 
  },
  expected_concepts: {
    type: DataTypes.JSON,
  },
  is_weekly: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  xp_reward: {
    type: DataTypes.INTEGER,
    defaultValue: 50,
  }
});

module.exports = DailyChallenge;