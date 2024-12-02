const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/user');

const register = async (req, res) => {
    const timeLabel = `Register_${Date.now()}`;
    console.time(timeLabel);
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        console.time('Check Existing User');
        const existingUser = await User.findOne({ email });
        console.timeEnd('Check Existing User');

        if (existingUser) {
            console.timeEnd(timeLabel);
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        console.time('Password Hashing');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        console.timeEnd('Password Hashing');

        // Create new user
        console.time('Create User');
        const user = new User({
            username,
            email,
            password: hashedPassword,
            books: []
        });
        await user.save();
        console.timeEnd('Create User');

        // Generate JWT token
        console.time('Token Generation');
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        console.timeEnd('Token Generation');

        console.timeEnd(timeLabel);
        res.status(201).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.timeEnd(timeLabel);
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { register };