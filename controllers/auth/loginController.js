// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const User = require('../../models/user');

// const login = async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         // Check if user exists
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(400).json({ message: 'Invalid credentials' });
//         }

//         // Validate password
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.status(400).json({ message: 'Invalid credentials' });
//         }

//         // Create JWT token
//         const token = jwt.sign(
//             { userId: user._id },
//             process.env.JWT_SECRET,
//             { expiresIn: '24h' }
//         );

//         res.json({
//             token,
//             user: {
//                 id: user._id,
//                 username: user.username,
//                 email: user.email
//             }
//         });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Server error' });
//     }
// };

// module.exports = login;

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const localDb = require('../../local-db/LocalDatabase');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Debug logs
        console.log('Login attempt for:', email);

        console.time('Find User');
        const user = await localDb.findUserByEmail(email);
        console.timeEnd('Find User');

        // Debug log found user
        console.log('Found user:', user);

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Debug log password comparison
        console.log('Comparing passwords...');
        console.log('Provided password:', password);
        console.log('Stored hash:', user.password);

        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isMatch);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = login;