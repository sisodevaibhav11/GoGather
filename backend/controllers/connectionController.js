const Connection = require('../models/connectionModel');
const Trip = require('../models/tripModel');
const catchAsync = require('../utils/catchAsync');
const { buildPairKey, locationsMatch } = require('../utils/tripMatching');

const ensureMatchingTrips = (firstTrip, secondTrip) => firstTrip.travelDate === secondTrip.travelDate;

exports.requestConnection = catchAsync(async (req, res) => {
    const { ownTripId, targetTripId } = req.body;

    if (!ownTripId || !targetTripId) {
        return res.status(400).json({ message: 'Both trip ids are required.' });
    }

    const ownTrip = await Trip.findOne({ _id: ownTripId, user: req.user._id }).populate('user');
    const targetTrip = await Trip.findById(targetTripId).populate('user');

    if (!ownTrip || !targetTrip) {
        return res.status(404).json({ message: 'Trip not found.' });
    }

    if (String(ownTrip.user._id) === String(targetTrip.user._id)) {
        return res.status(400).json({ message: 'You cannot connect with your own trip.' });
    }

    if (!ensureMatchingTrips(ownTrip, targetTrip)) {
        return res.status(400).json({ message: 'Trips must be on the same date to connect.' });
    }

    const matchWindow = Math.min(ownTrip.matchingWindowMinutes, targetTrip.matchingWindowMinutes);
    const timeDifference = Math.abs(ownTrip.arrivalTimeMinutes - targetTrip.arrivalTimeMinutes);
    const sameArrivalArea = locationsMatch(ownTrip.arrivalLocation, targetTrip.arrivalLocation);

    if (!sameArrivalArea || timeDifference > matchWindow) {
        return res.status(400).json({
            message: 'You can only connect with trips that are currently valid matches.',
        });
    }

    const pairKey = buildPairKey(ownTrip._id, targetTrip._id);
    const orderedTrips = [ownTrip, targetTrip].sort((first, second) => String(first._id).localeCompare(String(second._id)));

    let connection = await Connection.findOne({ pairKey });

    if (!connection) {
        connection = await Connection.create({
            pairKey,
            tripA: orderedTrips[0]._id,
            tripB: orderedTrips[1]._id,
            userA: orderedTrips[0].user._id,
            userB: orderedTrips[1].user._id,
            requestedBy: [req.user._id],
            status: 'pending',
        });
    } else if (!connection.requestedBy.some((item) => String(item) === String(req.user._id))) {
        connection.requestedBy.push(req.user._id);
    }

    if (connection.requestedBy.length >= 2) {
        connection.status = 'mutual';
        connection.revealedAt = new Date();
    }

    await connection.save();

    res.status(200).json({
        message: connection.status === 'mutual'
            ? 'Connection confirmed. Phone numbers are now revealed to both travelers.'
            : 'Connection request sent.',
        connection: {
            status: connection.status,
            pairKey: connection.pairKey,
        },
    });
});

exports.getNotifications = catchAsync(async (req, res) => {
    const ownTrips = await Trip.find({ user: req.user._id }).select('_id arrivalLocation travelDate arrivalTime shareCode');
    const ownTripIds = ownTrips.map((trip) => trip._id);

    const connections = await Connection.find({
        status: 'pending',
        $or: [
            { tripA: { $in: ownTripIds } },
            { tripB: { $in: ownTripIds } },
        ],
    }).populate('userA', 'name photoUrl').populate('userB', 'name photoUrl').populate('tripA').populate('tripB');

    const notifications = connections
        .filter((connection) => !connection.requestedBy.some((item) => String(item) === String(req.user._id)))
        .map((connection) => {
            const isUserTripA = ownTripIds.some((id) => String(id) === String(connection.tripA._id));
            const ownTrip = isUserTripA ? connection.tripA : connection.tripB;
            const otherTrip = isUserTripA ? connection.tripB : connection.tripA;
            const otherUser = isUserTripA ? connection.userB : connection.userA;

            return {
                connectionId: connection._id,
                ownTripId: ownTrip._id,
                targetTripId: otherTrip._id,
                tripLabel: `${ownTrip.arrivalLocation.name} on ${ownTrip.travelDate} at ${ownTrip.arrivalTime}`,
                requester: {
                    name: otherUser.name,
                    photoUrl: otherUser.photoUrl,
                },
            };
        });

    res.status(200).json({ notifications });
});
