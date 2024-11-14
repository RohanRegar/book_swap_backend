// const User = require('../../models/user');

// const getUserBooks = async (req, res) => {
//     try {
//         // Fetch from database
//         const user = await User.findById(req.user._id)
//             .populate('books')
//             .select('-password');

//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         const response = {
//             user: {
//                 id: user._id,
//                 username: user.username,
//                 email: user.email
//             },
//             books: user.books
//         };

//         res.json(response);

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Error fetching user books' });
//     }
// };

// module.exports = getUserBooks; 

const localDb = require('../../local-db/LocalDatabase');

const getUserBooks = async (req, res) => {
    try {
        console.time('Get User Books');
        // Fetch user from local database
        const user = await localDb.findUserById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Fetch all books belonging to the user
        const userBooks = await localDb.findBooksByOwner(user._id);
        console.timeEnd('Get User Books');

        const response = {
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            },
            books: userBooks
        };

        res.json(response);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching user books' });
    }
};

module.exports = { getUserBooks };