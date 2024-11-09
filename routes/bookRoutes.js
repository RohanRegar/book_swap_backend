const express = require('express');
const router = express.Router();
const addBook = require('../controllers/books/addBookController');
const getUserBooks = require('../controllers/books/getUserBooksController');
const { protect } = require('../middlewares/authMiddleware');  // Update this line

// Protected routes
router.post('/add', protect, addBook);  // Change authMiddleware to protect
router.get('/mybooks', protect, getUserBooks);  // Change authMiddleware to protect

module.exports = router;