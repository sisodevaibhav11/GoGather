const express = require('express');
const { createReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.post('/', createReport);

module.exports = router;
