const Group = require('../models/groupModel');
const Trip = require('../models/tripModel');
const catchAsync = require('../utils/catchAsync');

exports.createGroup = catchAsync(async (req, res) => {
    const { tripId } = req.body;
    if (!tripId) return res.status(400).json({ message: 'tripId is required' });

    const trip = await Trip.findOne({ _id: tripId, user: req.user._id });
    if (!trip) return res.status(404).json({ message: 'Trip not found or not owned by user.' });

    const existing = await Group.findOne({ trip: trip._id });
    if (existing) return res.status(400).json({ message: 'Group already exists for this trip.' });

    const group = await Group.create({
        owner: req.user._id,
        trip: trip._id,
        travelDate: trip.travelDate,
        arrivalLocation: { name: trip.arrivalLocation?.name || '', coordinates: trip.arrivalLocation?.coordinates || null },
        members: [{ user: req.user._id, trip: trip._id, status: 'approved', joinedAt: new Date() }],
    });

    res.status(201).json({ message: 'Group created', groupId: group._id });
});

exports.joinGroup = catchAsync(async (req, res) => {
    const { groupId } = req.params;
    const { tripId } = req.body;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    // prevent duplicate join
    if (group.members.some((m) => String(m.user) === String(req.user._id))) {
        return res.status(400).json({ message: 'Already requested or member' });
    }

    group.members.push({ user: req.user._id, trip: tripId || undefined, status: 'pending' });
    await group.save();

    res.status(200).json({ message: 'Join request submitted' });
});

exports.reviewMember = catchAsync(async (req, res) => {
    const { groupId, userId } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (String(group.owner) !== String(req.user._id)) {
        return res.status(403).json({ message: 'Only owner can review members' });
    }

    const member = group.members.find((m) => String(m.user) === String(userId));
    if (!member) return res.status(404).json({ message: 'Member not found' });

    if (action === 'approve' || action === 'accept') {
        member.status = 'approved';
        member.joinedAt = new Date();
    } else if (action === 'reject') {
        member.status = 'rejected';
    } else {
        return res.status(400).json({ message: 'Invalid action' });
    }

    await group.save();

    res.status(200).json({ message: 'Member updated' });
});

exports.getGroup = catchAsync(async (req, res) => {
    const { groupId } = req.params;
    const group = await Group.findById(groupId).populate('owner', 'name photoUrl').populate('members.user', 'name photoUrl mobileNumber').populate('members.trip');
    if (!group) return res.status(404).json({ message: 'Group not found' });

    // only reveal mobileNumber for approved members when viewer is also approved
    const viewerApproved = group.members.some((m) => String(m.user) === String(req.user._id) && m.status === 'approved');

    const members = group.members.map((m) => ({
        user: m.user ? { id: m.user._id, name: m.user.name, photoUrl: m.user.photoUrl, mobileNumber: m.status === 'approved' && viewerApproved ? m.user.mobileNumber : null } : null,
        trip: m.trip,
        status: m.status,
        joinedAt: m.joinedAt,
    }));

    res.status(200).json({
        id: group._id,
        owner: group.owner,
        trip: group.trip,
        travelDate: group.travelDate,
        arrivalLocation: group.arrivalLocation,
        members,
    });
});

exports.getMyGroups = catchAsync(async (req, res) => {
    const groups = await Group.find({ $or: [ { owner: req.user._id }, { 'members.user': req.user._id } ] }).populate('owner', 'name photoUrl').populate('members.user', 'name photoUrl mobileNumber');

    const mapped = groups.map((g) => ({
        id: g._id,
        owner: g.owner,
        trip: g.trip,
        travelDate: g.travelDate,
        arrivalLocation: g.arrivalLocation,
        members: g.members.map((m) => ({ user: m.user ? { id: m.user._id, name: m.user.name, photoUrl: m.user.photoUrl, mobileNumber: m.status === 'approved' ? m.user.mobileNumber : null } : null, status: m.status }))
    }));

    res.status(200).json({ groups: mapped });
});
