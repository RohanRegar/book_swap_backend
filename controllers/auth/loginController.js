const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/user');

const login = async (req, res) => {
    const timeLabel = `Login_${Date.now()}`;
    console.time(timeLabel);
    try {
        const { email, password } = req.body;

        console.time('Database_Query');
        const user = await User.findOne({ email });
        console.timeEnd('Database_Query');

        if (!user) {
            console.timeEnd(timeLabel);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        console.time('Password_Comparison');
        const isMatch = await bcrypt.compare(password, user.password);
        console.timeEnd('Password_Comparison');

        if (!isMatch) {
            console.timeEnd(timeLabel);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        console.time('Token_Generation');
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        console.timeEnd('Token_Generation');

        console.timeEnd(timeLabel);
        res.json({
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

module.exports = { login };