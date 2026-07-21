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
        message: 'Report submitted. Thank you for helping keep GoGather safer.',
    });
});

exports.createIssueReport = catchAsync(async (req, res) => {
    const { type, email, subject, description } = req.body;

    if (!subject?.trim() || !description?.trim()) {
        return res.status(400).json({ message: 'Subject and description are required.' });
    }

    await Report.create({
        reporter: req.user ? req.user._id : undefined,
        reason: `[${(type || 'issue').toUpperCase()}] ${subject.trim()}: ${description.trim()} (Contact: ${email || 'Anonymous'})`,
    });

    res.status(201).json({
        message: 'Issue report submitted successfully. Thank you!',
    });
});
