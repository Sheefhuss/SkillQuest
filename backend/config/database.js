const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
    connectTimeout: 10000,
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 20000,
    idle: 10000,
    evict: 1000,
  },
  logging: false,
});

setInterval(async () => {
  try {
    await sequelize.query('SELECT 1');
  } catch {}
}, 3 * 60 * 1000);

module.exports = sequelize;
