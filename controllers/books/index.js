const { addBook } = require('./addBookController');
const { getBooksByGenre } = require('./getBooksByGenreController');
const { getUserBooks } = require('./getUserBooksController');
const { searchBooksByTitle } = require('./searchBooksController');
const { getBookById, getBookByTitle } = require('./getBookController');
const { removeBook } = require('./removeBookController');

module.exports = {
    addBook,
    getBooksByGenre,
    getUserBooks,
    searchBooksByTitle,
    getBookById,
    getBookByTitle,
    removeBook
}; 