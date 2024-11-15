const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const getUserProfile = require('../controllers/users/getUserProfileController');
const { getUserById } = require('../controllers/users/getUserByIdController');
const { getPublicUserInfo } = require('../controllers/users/getPublicUserInfoController');

// Profile route
router.get('/profile', protect, getUserProfile);

// Add this route - make sure it's before any protected routes
router.get('/public/:userId', getPublicUserInfo);

module.exports = router; 