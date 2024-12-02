const User = require('../../models/user');
const Book = require('../../models/book');

const getUserBooks = async (req, res) => {
    const timeLabel = `GetUserBooks_${Date.now()}`;
    console.time(timeLabel);
    try {
        console.time('Find_User');
        const user = await User.findById(req.user._id).populate('books');
        console.timeEnd('Find_User');

        if (!user) {
            console.timeEnd(timeLabel);
            return res.status(404).json({ message: 'User not found' });
        }

        console.timeEnd(timeLabel);
        const response = {
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            },
            books: user.books
        };

        res.json(response);
    } catch (error) {
        console.timeEnd(timeLabel);
        console.error(error);
        res.status(500).json({ message: 'Error fetching user books' });
    }
};

module.exports = { getUserBooks };