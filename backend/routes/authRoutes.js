const express = require('express');
const Router = express.Router();
const {
    googleAuth,
    getCurrentUser,
    updateProfile,
    logout,
} = require('../controllers/authController');
const { attachUserIfPresent, protect } = require('../middleware/authMiddleware');

Router.post('/google', googleAuth);
Router.get('/me', attachUserIfPresent, getCurrentUser);
Router.patch('/profile', protect, updateProfile);
Router.post('/logout', logout);

module.exports = Router;
