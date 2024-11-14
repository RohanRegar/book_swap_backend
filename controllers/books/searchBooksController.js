const localDb = require('../../local-db/LocalDatabase');

const searchBooksByTitle = async (req, res) => {
    try {
        const { title } = req.query;

        if (!title) {
            return res.status(400).json({
                success: false,
                message: 'Title parameter is required'
            });
        }

        const books = await localDb.findBooksByTitle(title);

        res.status(200).json({
            success: true,
            data: books,
            message: `Found ${books.length} books matching "${title}"`
        });
    } catch (error) {
        console.error('Search books error:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching books',
            error: error.message
        });
    }
};

module.exports = { searchBooksByTitle }; 