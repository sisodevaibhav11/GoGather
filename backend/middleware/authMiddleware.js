const User = require('../models/userModel');
const { verifyToken } = require('../utils/jwt');

const resolveUserFromRequest = async (req) => {
    const bearerToken = req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null;
    const token = req.cookies.gogather_token || bearerToken;

    if (!token) {
        return null;
    }

    const decoded = verifyToken(token);
    return User.findById(decoded.userId);
};

exports.protect = async (req, res, next) => {
    try {
        const user = await resolveUserFromRequest(req);

        if (!user) {
            return res.status(401).json({ message: 'Please log in to continue.' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Please log in again.' });
    }
};

exports.attachUserIfPresent = async (req, res, next) => {
    try {
        req.user = await resolveUserFromRequest(req);
    } catch (error) {
        req.user = null;
    }

    next();
};
