const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const getUserProfile = require('../controllers/users/getUserProfileController');

// Profile route
router.get('/profile', protect, getUserProfile);

module.exports = router; 