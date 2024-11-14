// const jwt = require('jsonwebtoken');
// const User = require('../models/user');

// const protect = async (req, res, next) => {
//   try {
//     let token;

//     if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//       token = req.headers.authorization.split(' ')[1];
//     }

//     if (!token) {
//       return res.status(401).json({ message: 'Not authorized, no token' });
//     }

//     // Verify token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // Get user from database
//     const user = await User.findById(decoded.userId).select('-password');

//     if (!user) {
//       return res.status(401).json({ message: 'User not found' });
//     }

//     // Add user to request object
//     req.user = user;
//     next();

//   } catch (error) {
//     console.error(error);
//     res.status(401).json({ message: 'Not authorized, token failed' });
//   }
// };

// module.exports = { protect };

const jwt = require('jsonwebtoken');
const localDb = require('../local-db/LocalDatabase');

const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await localDb.findUserById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = { protect };