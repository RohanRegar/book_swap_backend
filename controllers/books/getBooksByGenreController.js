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
    const timeLabel = `GetBooksByGenre_${Date.now()}`;
    console.time(timeLabel);
    try {
        const { genre } = req.params;

        const queryLabel = `FindBooksByGenre_${Date.now()}`;
        console.time(queryLabel);
        const books = await localDb.findBooksByGenre(genre);
        console.timeEnd(queryLabel);

        console.timeEnd(timeLabel);
        res.json(books);
    } catch (error) {
        console.timeEnd(timeLabel);
        console.error('Error fetching books by genre:', error);
        res.status(500).json({ message: 'Error fetching books by genre' });
    }
};

module.exports = { getBooksByGenre };