const express = require('express');
const { createReport, createIssueReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/issue', createIssueReport);
router.use(protect);
router.post('/', createReport);

module.exports = router;
