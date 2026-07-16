const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
    createGroup,
    joinGroup,
    reviewMember,
    getGroup,
    getMyGroups,
} = require('../controllers/groupController');

const router = express.Router();

router.use(protect);

router.post('/', createGroup);
router.post('/:groupId/join', joinGroup);
router.patch('/:groupId/members/:userId', reviewMember);
router.get('/:groupId', getGroup);
router.get('/mine', getMyGroups);

module.exports = router;
