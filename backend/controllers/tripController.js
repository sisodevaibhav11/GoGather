const Trip = require('../models/tripModel');
const Connection = require('../models/connectionModel');
const catchAsync = require('../utils/catchAsync');
const {
    parseTimeToMinutes,
    normalizeLocationName,
    isFutureOrToday,
    sanitizeMatchingWindow,
} = require('../utils/validators');
const {
    locationsMatch,
    buildTimeDifferenceLabel,
    buildPairKey,
    getConnectionState,
} = require('../utils/tripMatching');

const createShareCode = () => `tb-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const formatLocation = (location) => {
    if (!location) {
        return null;
    }

    return {
        name: location.name,
        coordinates: Number.isFinite(location.coordinates?.lat) && Number.isFinite(location.coordinates?.lng)
            ? location.coordinates
            : null,
    };
};

const formatTrip = (trip) => ({
    id: trip._id,
    arrivalLocation: formatLocation(trip.arrivalLocation),
    destination: formatLocation(trip.destination),
    travelDate: trip.travelDate,
    arrivalTime: trip.arrivalTime,
    matchingWindowMinutes: trip.matchingWindowMinutes,
    status: trip.status,
    shareCode: trip.shareCode,
    createdAt: trip.createdAt,
});

const buildMatchCard = ({ trip, otherTrip, connection, viewerId }) => {
    const minutesDifference = otherTrip.arrivalTimeMinutes - trip.arrivalTimeMinutes;
    const connectionState = getConnectionState(connection, viewerId);

    return {
        tripId: otherTrip._id,
        shareCode: otherTrip.shareCode,
        user: {
            id: otherTrip.user._id,
            name: otherTrip.user.name,
            photoUrl: otherTrip.user.photoUrl,
            mobileNumber: connectionState.contactUnlocked ? otherTrip.user.mobileNumber : null,
        },
        arrivalLocation: formatLocation(otherTrip.arrivalLocation),
        destination: formatLocation(otherTrip.destination),
        travelDate: otherTrip.travelDate,
        arrivalTime: otherTrip.arrivalTime,
        status: otherTrip.status,
        timeDifferenceMinutes: minutesDifference,
        timeDifferenceLabel: buildTimeDifferenceLabel(minutesDifference),
        connection: connectionState,
    };
};

exports.createTrip = catchAsync(async (req, res) => {
    const {
        arrivalLocation,
        destination,
        travelDate,
        arrivalTime,
        matchingWindowMinutes,
    } = req.body;

    if (!req.user.profileCompleted) {
        return res.status(400).json({
            message: 'Please add your mobile number before creating a trip.',
        });
    }

    if (!arrivalLocation?.name) {
        return res.status(400).json({ message: 'Arrival location is required.' });
    }

    if (!travelDate || !isFutureOrToday(travelDate)) {
        return res.status(400).json({ message: 'Travel date cannot be in the past.' });
    }

    const arrivalTimeMinutes = parseTimeToMinutes(arrivalTime);
    if (arrivalTimeMinutes === null) {
        return res.status(400).json({ message: 'Please enter a valid arrival time.' });
    }

    const trip = await Trip.create({
        user: req.user._id,
        arrivalLocation: {
            name: arrivalLocation.name.trim(),
            normalizedName: normalizeLocationName(arrivalLocation.name),
            coordinates: arrivalLocation.coordinates || undefined,
        },
        destination: destination?.name ? {
            name: destination.name.trim(),
            normalizedName: normalizeLocationName(destination.name),
            coordinates: destination.coordinates || undefined,
        } : null,
        travelDate,
        arrivalTime,
        arrivalTimeMinutes,
        matchingWindowMinutes: sanitizeMatchingWindow(matchingWindowMinutes),
        shareCode: createShareCode(),
    });

    res.status(201).json({
        message: 'Trip created successfully.',
        trip: formatTrip(trip),
    });
});

exports.getMyTrips = catchAsync(async (req, res) => {
    const trips = await Trip.find({ user: req.user._id })
        .sort({ travelDate: 1, arrivalTimeMinutes: 1 });

    res.status(200).json({
        trips: trips.map(formatTrip),
    });
});

exports.getTripDetails = catchAsync(async (req, res) => {
    const trip = await Trip.findOne({
        _id: req.params.tripId,
        user: req.user._id,
    });

    if (!trip) {
        return res.status(404).json({ message: 'Trip not found.' });
    }

    res.status(200).json({ trip: formatTrip(trip) });
});

exports.getTripByShareCode = catchAsync(async (req, res) => {
    const trip = await Trip.findOne({ shareCode: req.params.shareCode }).populate('user', 'name photoUrl');

    if (!trip) {
        return res.status(404).json({ message: 'Trip not found.' });
    }

    res.status(200).json({
        trip: {
            ...formatTrip(trip),
            user: trip.user ? {
                name: trip.user.name,
                photoUrl: trip.user.photoUrl,
            } : null,
        },
    });
});

exports.getTripMatches = catchAsync(async (req, res) => {
    const trip = await Trip.findOne({
        _id: req.params.tripId,
        user: req.user._id,
    });

    if (!trip) {
        return res.status(404).json({ message: 'Trip not found.' });
    }

    const candidateTrips = await Trip.find({
        _id: { $ne: trip._id },
        user: { $ne: req.user._id },
        travelDate: trip.travelDate,
        status: { $ne: 'done' },
    }).populate('user');

    const relatedConnections = await Connection.find({
        $or: [
            { tripA: trip._id },
            { tripB: trip._id },
        ],
    });

    const connectionMap = new Map(
        relatedConnections.map((connection) => [connection.pairKey, connection])
    );

    const matches = candidateTrips
        .filter((otherTrip) => {
            const matchWindow = Math.min(trip.matchingWindowMinutes, otherTrip.matchingWindowMinutes);
            const timeDifference = Math.abs(otherTrip.arrivalTimeMinutes - trip.arrivalTimeMinutes);

            return locationsMatch(trip.arrivalLocation, otherTrip.arrivalLocation) && timeDifference <= matchWindow;
        })
        .map((otherTrip) => buildMatchCard({
            trip,
            otherTrip,
            connection: connectionMap.get(buildPairKey(trip._id, otherTrip._id)),
            viewerId: req.user._id,
        }))
        .sort((first, second) => Math.abs(first.timeDifferenceMinutes) - Math.abs(second.timeDifferenceMinutes));

    res.status(200).json({
        trip: formatTrip(trip),
        matches,
        emptyState: matches.length === 0
            ? 'No one is matched yet. Share your trip link so others can find you.'
            : null,
    });
});

exports.updateTripStatus = catchAsync(async (req, res) => {
    const allowedStatuses = ['waiting', 'matched', 'done'];
    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid trip status.' });
    }

    const trip = await Trip.findOneAndUpdate(
        { _id: req.params.tripId, user: req.user._id },
        { status },
        { new: true }
    );

    if (!trip) {
        return res.status(404).json({ message: 'Trip not found.' });
    }

    res.status(200).json({
        message: 'Trip status updated.',
        trip: formatTrip(trip),
    });
});
