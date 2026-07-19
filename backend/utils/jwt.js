const jwt = require('jsonwebtoken');

const signToken = (user) => jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_TIMEOUT || '7d' }
);

const isProduction = process.env.NODE_ENV === 'production';

exports.setAuthCookie = (res, user) => {
    const token = signToken(user);
    res.cookie('gogather_token', token, {
        httpOnly: true,
        sameSite: isProduction ? 'none' : 'lax',
        secure: isProduction,
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};

exports.clearAuthCookie = (res) => {
    res.clearCookie('gogather_token', {
        httpOnly: true,
        sameSite: isProduction ? 'none' : 'lax',
        secure: isProduction,
        path: '/',
    });
};

exports.verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);
