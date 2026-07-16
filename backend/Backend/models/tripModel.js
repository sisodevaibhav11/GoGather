const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    normalizedName: {
        type: String,
        required: true,
        trim: true,
    },
    coordinates: {
        lat: Number,
        lng: Number,
    },
}, { _id: false });

const tripSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    arrivalLocation: {
        type: locationSchema,
        required: true,
    },
    destination: {
        type: locationSchema,
        default: null,
    },
    travelDate: {
        type: String,
        required: true,
        index: true,
    },
    arrivalTime: {
        type: String,
        required: true,
    },
    arrivalTimeMinutes: {
        type: Number,
        required: true,
        min: 0,
        max: 1439,
        index: true,
    },
    matchingWindowMinutes: {
        type: Number,
        enum: [30, 45, 60],
        default: 45,
    },
    status: {
        type: String,
        enum: ['waiting', 'matched', 'done'],
        default: 'waiting',
    },
    shareCode: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Trip', tripSchema);
