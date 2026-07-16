const Report = require('../models/reportModel');
const Trip = require('../models/tripModel');
const catchAsync = require('../utils/catchAsync');

exports.createReport = catchAsync(async (req, res) => {
    const { tripId, reportedUserId, reason } = req.body;

    if (!tripId || !reportedUserId || !reason?.trim()) {
        return res.status(400).json({ message: 'Trip, user, and reason are required.' });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
        return res.status(404).json({ message: 'Trip not found.' });
    }

    await Report.create({
        reporter: req.user._id,
        reportedUser: reportedUserId,
        trip: tripId,
        reason: reason.trim(),
    });

    res.status(201).json({
        message: 'Report submitted. Thank you for helping keep TravelBuddy safer.',
    });
});
