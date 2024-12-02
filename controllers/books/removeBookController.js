const Book = require('../../models/book'); // Import Book model
const User = require('../../models/user'); // Import User model

const removeBook = async (req, res) => {
    const timeLabel = `RemoveBook_${Date.now()}`;
    console.time(timeLabel);
    try {
        const { bookId } = req.params; // Get book ID from request parameters

        // Validate book ID
        if (!bookId) {
            return res.status(400).json({ message: 'Book ID is required' });
        }

        // Find the book and remove it
        const book = await Book.findByIdAndDelete(bookId); // Remove book from database

        if (!book) {
            console.timeEnd(timeLabel);
            return res.status(404).json({ message: 'Book not found' });
        }

        // Remove book reference from user's books array
        await User.findByIdAndUpdate(req.user._id, { $pull: { books: bookId } });

        console.timeEnd(timeLabel);
        res.status(200).json({
            success: true,
            message: 'Book removed successfully',
            bookId
        });
    } catch (error) {
        console.timeEnd(timeLabel);
        console.error('Error removing book:', error);
        res.status(500).json({ message: 'Error removing book', error: error.message });
    }
};

module.exports = { removeBook }; 