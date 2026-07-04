const jwt = require('jsonwebtoken');

const signToken = (user) => jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_TIMEOUT || '7d' }
);

exports.setAuthCookie = (res, user) => {
    const token = signToken(user);
    res.cookie('travelbuddy_token', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};

exports.clearAuthCookie = (res) => {
    res.clearCookie('travelbuddy_token', {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
    });
};

exports.verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);
