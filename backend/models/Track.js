const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Track = sequelize.define('Track', {
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  icon: {
    type: DataTypes.STRING,
    comment: "Lucide icon name",
  },
  accent_color: {
    type: DataTypes.STRING,
    comment: "Hex accent color",
  },
  category: {
    type: DataTypes.STRING,
  },
  is_free: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  }
});

module.exports = Track;