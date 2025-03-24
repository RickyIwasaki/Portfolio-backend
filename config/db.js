const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.PG_DATABASE,
  process.env.PG_USER,
  process.env.PG_PASSWORD, 
  {
    host: process.env.PG_HOST,
    dialect: 'postgres',
    port: process.env.PG_PORT || 5432,
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL Connected...');
    
    // Sync all models with database
    // Note: In production, you might want to use migrations instead
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('All models were synchronized successfully.');
  } catch (err) {
    console.error(`Error connecting to PostgreSQL: ${err.message}`);
    process.exit(1);
  }
};

module.exports = { connectDB, sequelize }; 