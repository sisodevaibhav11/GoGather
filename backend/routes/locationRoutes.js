const express = require('express');
const { getSuggestions } = require('../controllers/locationController');

const router = express.Router();

router.get('/suggestions', getSuggestions);

module.exports = router;
