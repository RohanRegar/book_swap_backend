const Book = require('../../models/book');

const getBooksByGenre = async (req, res) => {
    const timeLabel = `GetBooksByGenre_${Date.now()}`;
    console.time(timeLabel);
    try {
        const { genre } = req.params;

        console.time('Database_Query');
        const books = await Book.find({ genre });
        console.timeEnd('Database_Query');

        console.timeEnd(timeLabel);
        res.json(books);
    } catch (error) {
        console.timeEnd(timeLabel);
        console.error('Error fetching books by genre:', error);
        res.status(500).json({ message: 'Error fetching books by genre' });
    }
};

module.exports = { getBooksByGenre };