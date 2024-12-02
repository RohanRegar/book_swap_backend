const Book = require('../../models/book');

const getBookById = async (req, res) => {
    const timeLabel = `GetBookById_${Date.now()}`;
    console.time(timeLabel);
    try {
        const { id: _id } = req.params;

        console.time('Validation');
        if (!_id || _id.trim() === '') {
            console.timeEnd('Validation');
            console.timeEnd(timeLabel);
            return res.status(400).json({
                success: false,
                message: 'Book ID is required'
            });
        }
        console.timeEnd('Validation');

        console.time('Database_Query');
        const book = await Book.findById(_id);
        console.timeEnd('Database_Query');

        if (!book) {
            console.timeEnd(timeLabel);
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        console.timeEnd(timeLabel);
        res.status(200).json({
            success: true,
            data: book,
            message: 'Book retrieved successfully'
        });
    } catch (error) {
        console.timeEnd(timeLabel);
        console.error('Get book error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving book',
            error: error.message
        });
    }
};

const getBookByTitle = async (req, res) => {
    const timeLabel = `GetBookByTitle_${Date.now()}`;
    console.time(timeLabel);
    try {
        const { title } = req.params;

        console.time('Validation');
        if (!title) {
            console.timeEnd('Validation');
            console.timeEnd(timeLabel);
            return res.status(400).json({
                success: false,
                message: 'Book title is required'
            });
        }
        console.timeEnd('Validation');

        console.time('Database_Query');
        const books = await Book.find({ title: { $regex: title, $options: 'i' } });
        console.timeEnd('Database_Query');

        console.timeEnd(timeLabel);
        res.status(200).json({
            success: true,
            data: books,
            message: `Found ${books.length} books matching "${title}"`
        });
    } catch (error) {
        console.timeEnd(timeLabel);
        console.error('Get book by title error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving book',
            error: error.message
        });
    }
};

module.exports = {
    getBookById,
    getBookByTitle
}; 