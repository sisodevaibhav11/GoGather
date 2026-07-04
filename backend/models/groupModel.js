const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    joinedAt: Date,
}, { _id: false });

const groupSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
    members: [memberSchema],
    travelDate: String,
    arrivalLocation: {
        name: String,
        coordinates: { lat: Number, lng: Number },
    },
}, { timestamps: true });

module.exports = mongoose.model('Group', groupSchema);
