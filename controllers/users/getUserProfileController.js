const User = require('../../models/user'); // Import User model

async function getUserProfile(req, res) {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId); // Use User model

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const { password, ...userProfile } = user.toObject();

        res.status(200).json({
            success: true,
            data: userProfile,
            message: 'Profile retrieved successfully'
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving profile',
            error: error.message
        });
    }
}

module.exports = getUserProfile; 