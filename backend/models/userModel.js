const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId: {
        type: String,
        index: true,
        sparse: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    passwordHash: {
        type: String,
        default: '',
        select: false,
    },
    photoUrl: {
        type: String,
        default: '',
    },
    mobileNumber: {
        type: String,
        default: '',
    },
    hostel: {
        type: String,
        default: '',
        trim: true,
    },
    profileCompleted: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
