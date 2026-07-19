const bcrypt = require('bcryptjs');
const { verifyGoogleToken } = require('../utils/googleClient');
const User = require('../models/userModel');
const { connectToDatabase } = require('../models/dbConnect');
const catchAsync = require('../utils/catchAsync');
const { setAuthCookie, clearAuthCookie } = require('../utils/jwt');
const { isValidMobileNumber } = require('../utils/validators');

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isStrongEnoughPassword = (value) => typeof value === 'string' && value.trim().length >= 8;

const serializeUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    photoUrl: user.photoUrl,
    mobileNumber: user.mobileNumber,
    hostel: user.hostel,
    profileCompleted: user.profileCompleted,
    createdAt: user.createdAt,
});

const normalizeAuthInput = ({ name, email, password }) => ({
    name: typeof name === 'string' ? name.trim() : '',
    email: typeof email === 'string' ? email.toLowerCase().trim() : '',
    password: typeof password === 'string' ? password : '',
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

exports.signupWithPassword = catchAsync(async (req, res) => {
    const { name, email, password } = normalizeAuthInput(req.body);

    if (!name || name.length < 2) {
        return res.status(400).json({ message: 'Please enter your name.' });
    }

    if (!isValidEmail(email)) {
        return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    if (!isStrongEnoughPassword(password)) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email }).select('+passwordHash');
    if (existingUser?.passwordHash) {
        return res.status(409).json({ message: 'An account with this email already exists. Please sign in instead.' });
    }

    if (existingUser?.googleId && !existingUser.passwordHash) {
        return res.status(409).json({ message: 'This email is already linked to Google sign-in. Please continue with Google.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
        name,
        email,
        passwordHash,
    });

    setAuthCookie(res, user);

    return res.status(201).json({
        message: 'Account created successfully.',
        user: serializeUser(user),
    });
});

exports.loginWithPassword = catchAsync(async (req, res) => {
    const { email, password } = normalizeAuthInput(req.body);

    if (!isValidEmail(email) || !password) {
        return res.status(400).json({ message: 'Please enter both email and password.' });
    }

    await connectToDatabase();

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
        return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (!user.passwordHash) {
        return res.status(400).json({ message: 'This account uses Google sign-in. Please continue with Google.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid email or password.' });
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
    const {
        mobileNumber,
        photoUrl,
        name,
        hostel,
    } = req.body;

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

    if (typeof hostel === 'string') {
        req.user.hostel = hostel.trim();
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
