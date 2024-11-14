const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
    addBook,
    getBooksByGenre,
    getUserBooks,
    searchBooksByTitle,
    getBookById,
    getBookByTitle
} = require('../controllers/books');

// Protected routes
router.post('/add', protect, addBook);
router.get('/mybooks', protect, getUserBooks);
router.get('/genre/:genre', getBooksByGenre);
router.get('/user/:userId', protect, getUserBooks);
router.get('/search', protect, searchBooksByTitle);

// New routes - make sure these come after other routes with parameters
router.get('/title/:title', getBookByTitle);
router.get('/:id', getBookById);

module.exports = router;