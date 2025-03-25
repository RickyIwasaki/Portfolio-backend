const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('PostgreSQL Connected...');
    
    // Release the client back to the pool
    client.release();
    
    // Note: Table initialization is now handled in each model file
    // This keeps the database logic close to the model definitions
  } catch (err) {
    console.error(`Error connecting to PostgreSQL: ${err.message}`);
    process.exit(1);
  }
};

module.exports = { connectDB, pool }; 