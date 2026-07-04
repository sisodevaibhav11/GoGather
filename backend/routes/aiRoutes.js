const express = require('express');
const { askAssistant } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.post('/', askAssistant);

module.exports = router;
