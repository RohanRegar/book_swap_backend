const Book = require('../models/book');

const addBook = async (req, res) => {
  const { title, author, genre, condition } = req.body;
  try {
    const book = await Book.create({
      title,
      author,
      genre,
      condition,
      owner: req.user.id, // assuming JWT middleware is in place
    });
    res.status(201).json(book);
  } catch (err) {
    res.status(500).json({ message: 'Error adding book' });
  }
};

const getBooks = async (req, res) => {
  try {
    const books = await Book.find().populate('owner', 'username');
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching books' });
  }
};

module.exports = { addBook, getBooks };
