const express = require('express');
const { requestConnection, getNotifications } = require('../controllers/connectionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/notifications', getNotifications);
router.post('/', requestConnection);

module.exports = router;
