// const Book = require('../../models/book');
// const User = require('../../models/user');

// module.exports = async (req, res) => {
//     try {
//         const { title, author, description, condition, genre, image } = req.body;

//         // Create new book with owner ID from the authenticated user
//         const book = new Book({
//             title,
//             author,
//             description,
//             condition,
//             genre,
//             image,
//             owner: req.user._id
//         });

//         // Save book to database
//         await book.save();

//         // Update user's books array
//         await User.findByIdAndUpdate(
//             req.user._id,
//             { $push: { books: book._id } },
//             { new: true }
//         );

//         res.status(201).json({
//             message: 'Book added successfully',
//             book
//         });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             message: 'Error adding book',
//             error: error.message
//         });
//     }
// };

const localDb = require('../../local-db/LocalDatabase');
const FileUtils = require('../../local-db/utils/fileUtils');

const addBook = async (req, res) => {
    try {
        const { title, author, description, condition, genre, image } = req.body;

        console.time('Add Book');
        const book = await localDb.addBook({
            title,
            author,
            description,
            condition,
            genre,
            image,
            owner: req.user._id,
            isAvailable: true
        });
        console.timeEnd('Add Book');

        // Update user's books array
        const user = await localDb.findUserById(req.user._id);
        user.books.push(book._id);
        await FileUtils.writeJsonFile('users.json', localDb.users);
        await localDb.saveIndexes();
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

module.exports = { addBook };