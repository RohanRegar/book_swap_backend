const User = require('../../models/user'); // Import User model

const getUserById = async (req, res) => {
    const timeLabel = `GetUserById_${Date.now()}`;
    console.time(timeLabel);
    try {
        const { userId } = req.params;

        if (!userId || userId.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        const user = await User.findById(userId).populate('books'); // Use User model
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const { password, ...userInfo } = user.toObject();
        res.status(200).json({
            success: true,
            data: userInfo,
            message: 'User retrieved successfully'
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving user',
            error: error.message
        });
    }
};

module.exports = { getUserById };