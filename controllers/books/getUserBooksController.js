const User = require('../../models/user');

const getUserBooks = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('books')
            .select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            },
            books: user.books
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching user books' });
    }
};

module.exports = getUserBooks; 