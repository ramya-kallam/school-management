const express = require('express');
const pool = require('../config/database');
const { schoolValidationRules, validate } = require('../middleware/validation');
const { calculateDistance } = require('../utils/distance');

const router = express.Router();

router.post('/addSchool', schoolValidationRules, validate, async (req, res) => {
  try {
    const { name, address, latitude, longitude } = req.body;
    const [result] = await pool.query(
      'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)',
      [name, address, latitude, longitude]
    );
    
    res.status(201).json({
      message: 'School added successfully',
      schoolId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding school', error: error.message });
  }
});

router.get('/listSchools', async (req, res) => {
  try {
    const { latitude, longitude } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const [schools] = await pool.query('SELECT * FROM schools');
    
    const sortedSchools = schools.map(school => ({
      ...school,
      distance: calculateDistance(
        parseFloat(latitude), 
        parseFloat(longitude), 
        school.latitude, 
        school.longitude
      )
    })).sort((a, b) => a.distance - b.distance);

    res.json(sortedSchools);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving schools', error: error.message });
  }
});

module.exports = router;