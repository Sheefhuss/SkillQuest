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
  badges: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  streak_days: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  longest_streak: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'All-time highest streak ever reached',
  },
  last_active_date: {
    type: DataTypes.STRING,
  },

  total_xp_earned: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Cumulative XP ever earned (xp can be reset for seasons; this never resets)',
  },
  last_tier_change_date: {
    type: DataTypes.STRING,
    defaultValue: null,
    comment: 'Date (YYYY-MM-DD) when level_tier last changed — useful for profile milestones',
  },

  last_completed_level_id: {
    type: DataTypes.INTEGER,
    defaultValue: null,
    comment: 'ID of the most recently completed level',
  },
  last_completed_level_date: {
    type: DataTypes.STRING,
    defaultValue: null,
    comment: 'Date (YYYY-MM-DD) of last level completion',
  },
  completed_tracks: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of track slugs where every level is completed',
  },

  challenges_passed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Total number of coding challenges passed (passed=true)',
  },
  challenges_attempted: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Total submissions attempted (including failures)',
  },
  quiz_attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  quiz_score_total: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Sum of all quiz scores — divide by quiz_attempts for average',
  },


  mock_tests_taken: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  mock_test_score_total: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Sum of all mock test scores — divide by mock_tests_taken for average',
  },
  mock_test_best_score: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },

  activity_log: {
  type: DataTypes.JSONB,
  defaultValue: [],
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
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  verify_token: {
    type: DataTypes.STRING,
    defaultValue: null,
  },
  verify_token_expiry: {
    type: DataTypes.DATE,
    defaultValue: null,
  },
  reset_token: {
    type: DataTypes.STRING,
    defaultValue: null,
  },
  reset_token_expiry: {
    type: DataTypes.DATE,
    defaultValue: null,
  },
});

module.exports = User;
