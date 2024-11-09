const Book = require('../../models/book');
const User = require('../../models/user');

module.exports = async (req, res) => {
    try {
        const { title, author, description, condition, genre, image } = req.body;

        // Log to debug
        console.log('User ID from token:', req.user); // Check what we're getting

        // Create new book with owner ID from the authenticated user
        const book = new Book({
            title,
            author,
            description,
            condition,
            genre,
            image,
            owner: req.user._id  // Changed from req.userId to req.user._id
        });

        // Save book to database
        await book.save();

        // Update user's books array
        await User.findByIdAndUpdate(
            req.user._id,  // Changed from req.userId to req.user._id
            { $push: { books: book._id } },
            { new: true }
        );

        res.status(201).json({
            message: 'Book added successfully',
            book
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Error adding book',
            error: error.message
        });
    }
};