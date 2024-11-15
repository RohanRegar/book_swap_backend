const LocalDatabase = require('../../local-db/LocalDatabase');

const getUserById = async (req, res) => {
    const timeLabel = `GetUserById_${Date.now()}`;
    console.time(timeLabel);
    try {
        const { userId } = req.params;

        console.time('Validation');
        if (!userId || userId.trim() === '') {
            console.timeEnd('Validation');
            console.timeEnd(timeLabel);
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }
        console.timeEnd('Validation');

        console.time('Database_Query');
        const user = await LocalDatabase.findUserById(userId);
        console.timeEnd('Database_Query');

        if (!user) {
            console.timeEnd(timeLabel);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Remove sensitive information
        const { password, ...userInfo } = user;

        console.timeEnd(timeLabel);
        res.status(200).json({
            success: true,
            data: {
                id: userInfo._id,
                username: userInfo.username,
                email: userInfo.email,
                books: userInfo.books,
                createdAt: userInfo.createdAt,
                updatedAt: userInfo.updatedAt
            },
            message: 'User retrieved successfully'
        });
    } catch (error) {
        console.timeEnd(timeLabel);
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving user',
            error: error.message
        });
    }
};

module.exports = { getUserById }; 