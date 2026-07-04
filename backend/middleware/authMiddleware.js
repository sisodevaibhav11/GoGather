const User = require('../models/userModel');
const { verifyToken } = require('../utils/jwt');

exports.protect = async (req, res, next) => {
    try {
        const bearerToken = req.headers.authorization?.startsWith('Bearer ')
            ? req.headers.authorization.split(' ')[1]
            : null;
        const token = req.cookies.travelbuddy_token || bearerToken;

        if (!token) {
            return res.status(401).json({ message: 'Please log in to continue.' });
        }

        const decoded = verifyToken(token);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ message: 'Your session is no longer valid.' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Please log in again.' });
    }
};
