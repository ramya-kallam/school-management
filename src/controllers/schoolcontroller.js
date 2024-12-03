const db = require('../config/db');

// Helper function to calculate distance
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

// Add School
const addSchool = (req, res) => {
  const { name, address, latitude, longitude } = req.body;

  if (!name || !address || latitude == null || longitude == null) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const query = 'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)';
  db.query(query, [name, address, latitude, longitude], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to add school.' });
    }
    res.status(201).json({ message: 'School added successfully.', schoolId: result.insertId });
  });
};

// List Schools
const listSchools = (req, res) => {
  const { latitude, longitude } = req.query;

  if (latitude == null || longitude == null) {
    return res.status(400).json({ error: 'Latitude and Longitude are required.' });
  }

  const query = 'SELECT * FROM schools';
  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to retrieve schools.' });
    }

    const userLat = parseFloat(latitude);
    const userLon = parseFloat(longitude);

    const sortedSchools = results.map((school) => ({
      ...school,
      distance: calculateDistance(userLat, userLon, school.latitude, school.longitude),
    })).sort((a, b) => a.distance - b.distance);

    res.status(200).json(sortedSchools);
  });
};

module.exports = { addSchool, listSchools };
