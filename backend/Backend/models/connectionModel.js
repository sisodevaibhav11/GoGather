const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
    pairKey: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    tripA: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip',
        required: true,
    },
    tripB: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip',
        required: true,
    },
    userA: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    userB: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    requestedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    status: {
        type: String,
        enum: ['pending', 'mutual'],
        default: 'pending',
    },
    revealedAt: Date,
}, {
    timestamps: true,
});

module.exports = mongoose.model('Connection', connectionSchema);
