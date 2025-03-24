const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { sequelize } = require('../config/db');

const router = express.Router();

// @route   GET api/portfolio
// @desc    Get portfolio data
// @access  Public
router.get('/', async (req, res) => {
  try {
    // This would typically fetch data from the PostgreSQL database
    // For now, we'll return dummy data
    res.json({
      success: true,
      data: {
        name: 'Portfolio Owner',
        title: 'Full Stack Developer',
        skills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL'],
        projects: [
          {
            id: 1,
            title: 'Portfolio Website',
            description: 'My personal portfolio website with PostgreSQL backend',
            technologies: ['React', 'Node.js', 'Express', 'PostgreSQL']
          }
        ]
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/portfolio
// @desc    Add or update portfolio data
// @access  Private (admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    // This would typically update data in the PostgreSQL database
    // For now, we'll just return the data that was sent
    res.status(201).json({
      success: true,
      data: req.body
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 