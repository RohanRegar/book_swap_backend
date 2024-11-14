const { login } = require('./loginController');
const { register } = require('./registerController');
const { logout } = require('./logoutController');

module.exports = {
    login,
    register,
    logout
};