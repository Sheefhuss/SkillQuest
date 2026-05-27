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
    type: DataTypes.STRING(32),   
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
