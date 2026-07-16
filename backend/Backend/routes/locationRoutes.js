const express = require('express');
const { getSuggestions, geocode } = require('../controllers/locationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect suggestions endpoint
router.get('/suggestions', protect, getSuggestions);
router.get('/geocode', protect, geocode);

module.exports = router;
