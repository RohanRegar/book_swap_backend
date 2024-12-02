const Book = require('../../models/book');
const User = require('../../models/user');

const addBook = async (req, res) => {
    const timeLabel = `AddBook_${Date.now()}`;
    console.time(timeLabel);
    try {
        const { title, author, description, condition, genre, image } = req.body;

        const book = new Book({
            title,
            author,
            description,
            condition,
            genre,
            image,
            owner: req.user._id,
            isAvailable: true
        });

        await book.save();

        await User.findByIdAndUpdate(req.user._id, { $push: { books: book._id } });

        console.timeEnd(timeLabel);
        res.status(201).json({
            message: 'Book added successfully',
            book
        });
    } catch (error) {
        console.timeEnd(timeLabel);
        console.error(error);
        res.status(500).json({
            message: 'Error adding book',
            error: error.message
        });
    }
};

module.exports = { addBook };