// models/XpEvent.js
// One row per (user, level, activity) — used as an idempotency key so the
// same XP event can never be awarded twice, even across page reloads or
// concurrent requests.
//
// Activities:  'lesson' | 'quiz' | 'level_complete'
// (Challenge XP is handled by levelSubmit.js which already deduplicates
//  via the Submission table — no XpEvent row is needed there.)

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const XpEvent = sequelize.define('XpEvent', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  level_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  activity: {
    type: DataTypes.STRING(32),   // 'lesson' | 'quiz' | 'level_complete'
    allowNull: false,
  },
}, {
  tableName: 'xp_events',
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'level_id', 'activity'],  // enforces uniqueness at DB level too
    },
  ],
});

module.exports = XpEvent;
