const express = require('express');
const {
    createTrip,
    getMyTrips,
    getTripDetails,
    getTripByShareCode,
    getTripMatches,
    updateTripStatus,
    updateTrip,
    deleteTrip,
} = require('../controllers/tripController');
const { protect } = require('../middleware/authMiddleware');
const { tripCreationLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

router.get('/share/:shareCode', getTripByShareCode);
router.use(protect);
router.get('/', getMyTrips);
router.post('/', tripCreationLimiter, createTrip);
router.patch('/:tripId', updateTrip);
router.delete('/:tripId', deleteTrip);
router.get('/:tripId', getTripDetails);
router.get('/:tripId/matches', getTripMatches);
router.patch('/:tripId/status', updateTripStatus);

module.exports = router;
