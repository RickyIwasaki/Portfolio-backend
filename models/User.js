const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

// Create users table if it doesn't exist
const createUsersTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(10) NOT NULL DEFAULT 'user',
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  try {
    await pool.query(createTableQuery);
    console.log('Users table check completed');
  } catch (err) {
    console.error('Error creating users table:', err);
    throw err;
  }
};

// Initialize the table
createUsersTable().catch(console.error);

// User model methods
const User = {
  // Find user by ID
  findById: async (id) => {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  },
  
  // Find user by email
  findByEmail: async (email) => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  },
  
  // Create a new user
  create: async (userData) => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw new Error('Please add a valid email');
    }
    
    // Validate password length
    if (!userData.password || userData.password.length < 12) {
      throw new Error('Password must be at least 12 characters');
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    
    const query = `
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const values = [
      userData.name,
      userData.email,
      hashedPassword,
      userData.role || 'user'
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  },
  
  // Update user
  update: async (id, userData) => {
    // If updating password, hash it
    if (userData.password) {
      const salt = await bcrypt.genSalt(12);
      userData.password = await bcrypt.hash(userData.password, salt);
    }
    
    // Build dynamic update query
    const fields = Object.keys(userData).filter(key => userData[key] !== undefined);
    if (fields.length === 0) return null;
    
    const setValues = fields.map((field, i) => `"${field}" = $${i + 1}`).join(', ');
    const values = fields.map(field => userData[field]);
    
    // Add updatedAt and id
    const query = `
      UPDATE users 
      SET ${setValues}, "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $${fields.length + 1}
      RETURNING *
    `;
    
    values.push(id);
    const result = await pool.query(query, values);
    return result.rows[0];
  },
  
  // Delete user
  delete: async (id) => {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  },
  
  // Helper methods for user instances
  getSignedJwtToken: (user) => {
    return jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
  },
  
  matchPassword: async (user, enteredPassword) => {
    return await bcrypt.compare(enteredPassword, user.password);
  }
};

module.exports = User; 