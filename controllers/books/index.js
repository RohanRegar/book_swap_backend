const { addBook } = require('./addBookController');
const { getBooksByGenre } = require('./getBooksByGenreController');
const { getUserBooks } = require('./getUserBooksController');
const { searchBooksByTitle } = require('./searchBooksController');
const { getBookById, getBookByTitle } = require('./getBookController');

module.exports = {
    addBook,
    getBooksByGenre,
    getUserBooks,
    searchBooksByTitle,
    getBookById,
    getBookByTitle
}; 