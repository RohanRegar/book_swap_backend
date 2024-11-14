// const Book = require('../../models/book');

// const getBooksByGenre = async (req, res) => {
//     try {
//         const { genre } = req.params;

//         // Fetch from database
//         const books = await Book.find({ genre }).populate('owner', 'username');

//         res.json(books);

//     } catch (error) {
//         console.error('Error fetching books by genre:', error);
//         res.status(500).json({ message: 'Error fetching books by genre' });
//     }
// };

// module.exports = getBooksByGenre; 
const localDb = require('../../local-db/LocalDatabase');

const getBooksByGenre = async (req, res) => {
    try {
        const { genre } = req.params;
        console.time('Get Books by Genre');
        const books = await localDb.findBooksByGenre(genre);
        console.timeEnd('Get Books by Genre');

        res.json(books);
    } catch (error) {
        console.error('Error fetching books by genre:', error);
        res.status(500).json({ message: 'Error fetching books by genre' });
    }
};

module.exports = { getBooksByGenre };