const { verifyGoogleToken } = require('../utils/googleClient');
const User = require('../models/userModel');
const { connectToDatabase } = require('../models/dbConnect');
const catchAsync = require('../utils/catchAsync');
const { setAuthCookie, clearAuthCookie } = require('../utils/jwt');
const { isValidMobileNumber } = require('../utils/validators');

const serializeUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    photoUrl: user.photoUrl,
    mobileNumber: user.mobileNumber,
    profileCompleted: user.profileCompleted,
    createdAt: user.createdAt,
});

exports.googleAuth = catchAsync(async (req, res) => {
    const { credential } = req.body;

    if (!credential) {
        return res.status(400).json({ message: 'Google credential is required.' });
    }

    await connectToDatabase();

    const payload = await verifyGoogleToken(credential);
    const email = payload.email?.toLowerCase().trim();

    if (!payload.email_verified || !email) {
        return res.status(401).json({ message: 'Google account could not be verified.' });
    }

    let user = await User.findOne({ email });

    if (!user) {
        user = await User.create({
            googleId: payload.sub,
            name: payload.name || 'GoGather User',
            email,
            photoUrl: payload.picture || '',
        });
    } else {
        user.googleId = user.googleId || payload.sub;
        user.name = payload.name || user.name;
        user.photoUrl = user.photoUrl || payload.picture || '';
        await user.save();
    }

    setAuthCookie(res, user);

    return res.status(200).json({
        message: 'Logged in successfully.',
        user: serializeUser(user),
    });
});

exports.getCurrentUser = catchAsync(async (req, res) => {
    res.status(200).json({
        user: req.user ? serializeUser(req.user) : null,
    });
});

exports.updateProfile = catchAsync(async (req, res) => {
    const { mobileNumber, photoUrl, name } = req.body;

    if (mobileNumber && !isValidMobileNumber(mobileNumber)) {
        return res.status(400).json({
            message: 'Please enter a valid mobile number with 10 to 15 digits.',
        });
    }

    if (typeof name === 'string' && name.trim()) {
        req.user.name = name.trim();
    }

    if (typeof photoUrl === 'string') {
        req.user.photoUrl = photoUrl.trim();
    }

    if (typeof mobileNumber === 'string') {
        req.user.mobileNumber = mobileNumber.trim();
    }

    req.user.profileCompleted = Boolean(req.user.mobileNumber);
    await req.user.save();

    res.status(200).json({
        message: 'Profile updated.',
        user: serializeUser(req.user),
    });
});

exports.logout = (req, res) => {
    clearAuthCookie(res);
    res.status(200).json({ message: 'Logged out successfully.' });
};
