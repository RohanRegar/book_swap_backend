const express = require('express');
const router = express.Router();
const addBook = require('../controllers/books/addBookController');
const getUserBooks = require('../controllers/books/getUserBooksController');
const getBooksByGenre = require('../controllers/books/getBooksByGenreController');
const { protect } = require('../middlewares/authMiddleware');

// Protected routes
router.post('/add', protect, addBook);
router.get('/mybooks', protect, getUserBooks);
router.get('/genre/:genre', getBooksByGenre);

module.exports = router;