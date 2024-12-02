const User = require('../../models/user');

const getPublicUserInfo = async (req, res) => {
    const timeLabel = `GetPublicUserInfo_${Date.now()}`;
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
        const user = await User.findById(userId);
        console.timeEnd('Database_Query');

        if (!user) {
            console.timeEnd(timeLabel);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Return only public information
        console.timeEnd(timeLabel);
        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                username: user.username,
                email: user.email
            },
            message: 'User information retrieved successfully'
        });
    } catch (error) {
        console.timeEnd(timeLabel);
        console.error('Get public user info error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving user information',
            error: error.message
        });
    }
};

module.exports = { getPublicUserInfo }; 