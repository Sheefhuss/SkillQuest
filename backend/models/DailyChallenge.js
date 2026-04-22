const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DailyChallenge = sequelize.define('DailyChallenge', {
  date: {
    type: DataTypes.DATEONLY, 
  },
  title: {
    type: DataTypes.STRING,const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DailyChallenge = sequelize.define('DailyChallenge', {
  date: {
    type: DataTypes.DATEONLY,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // ✅ FIX: Changed from ENUM to STRING
  // ENUM on Neon/PostgreSQL with sequelize.sync({ alter: true }) causes
  // "missing ) after argument list" or type errors during deploy on Render.
  // STRING is safe, simpler, and works identically for this use case.
  difficulty: {
    type: DataTypes.STRING,
    defaultValue: 'Medium',
  },
  prompt: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  starter_code: {
    type: DataTypes.TEXT,
  },
  expected_concepts: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  is_weekly: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  xp_reward: {
    type: DataTypes.INTEGER,
    defaultValue: 50,
  },
});

module.exports = DailyChallenge;
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
