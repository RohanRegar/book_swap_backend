const localDb = require('../../local-db/LocalDatabase');

const getBookById = async (req, res) => {
    try {
        const { id: _id } = req.params;
        console.log('Searching for book with ID:', _id);

        if (!_id || _id.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Book ID is required'
            });
        }

        // Add debugging logs
        console.log('Book ID type:', typeof _id);
        console.log('Book ID value:', _id);

        const book = await localDb.findBookById(_id);
        console.log('Search result:', book);

        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        res.status(200).json({
            success: true,
            data: book,
            message: 'Book retrieved successfully'
        });
    } catch (error) {
        console.error('Get book error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving book',
            error: error.message
        });
    }
};

const getBookByTitle = async (req, res) => {
    try {
        const { title } = req.params;

        if (!title) {
            return res.status(400).json({
                success: false,
                message: 'Book title is required'
            });
        }

        const books = await localDb.findBooksByTitle(title);

        res.status(200).json({
            success: true,
            data: books,
            message: `Found ${books.length} books matching "${title}"`
        });
    } catch (error) {
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