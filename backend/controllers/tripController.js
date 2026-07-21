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
    isValidMatch,
} = require('../utils/tripMatching');

const createShareCode = () => `tb-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const allowedTransportTypes = new Set(['airport', 'railway', 'bus-stand']);
const allowedDirections = new Set(['leaving-campus', 'coming-campus']);

const sanitizeTransportType = (value) => (allowedTransportTypes.has(value) ? value : 'railway');
const sanitizeDirection = (value) => (allowedDirections.has(value) ? value : 'leaving-campus');
const sanitizePartnersNeeded = (value) => {
    const numeric = Number(value);
    return [1, 2, 3, 4].includes(numeric) ? numeric : 2;
};
const sanitizeNote = (value) => (typeof value === 'string' ? value.trim().slice(0, 300) : '');

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
    transportType: trip.transportType,
    direction: trip.direction,
    partnersNeeded: trip.partnersNeeded,
    note: trip.note,
    status: trip.status,
    shareCode: trip.shareCode,
    createdAt: trip.createdAt,
});

const buildMatchCard = ({ trip, otherTrip, connection, viewerId, matchReasons = [], group = null }) => {
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
            matchReasons,
            group,
    };
};

exports.createTrip = catchAsync(async (req, res) => {
    const {
        arrivalLocation,
        destination,
        travelDate,
        arrivalTime,
        matchingWindowMinutes,
        transportType,
        direction,
        partnersNeeded,
        note,
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
        transportType: sanitizeTransportType(transportType),
        direction: sanitizeDirection(direction),
        partnersNeeded: sanitizePartnersNeeded(partnersNeeded),
        note: sanitizeNote(note),
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

exports.getPublicTrips = catchAsync(async (req, res) => {
    const filter = { status: { $ne: 'done' } };
    const { transportType } = req.query;

    if (transportType && allowedTransportTypes.has(transportType)) {
        filter.transportType = transportType;
    }

    const trips = await Trip.find(filter)
        .populate('user', 'name photoUrl')
        .sort({ createdAt: -1 })
        .limit(20);

    res.status(200).json({
        trips: trips.map((trip) => ({
            ...formatTrip(trip),
            user: trip.user ? {
                id: trip.user._id,
                name: trip.user.name,
                photoUrl: trip.user.photoUrl,
            } : null,
        })),
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

    // find groups anchored to candidate trips
    const Group = require('../models/groupModel');
    const candidateTripIds = candidateTrips.map((t) => t._id);
    const groups = await Group.find({ trip: { $in: candidateTripIds } }).populate('owner', 'name photoUrl').populate('members.user', 'name');
    const groupMap = new Map(groups.map((g) => [String(g.trip), g]));

    const matches = candidateTrips
        .map((otherTrip) => {
            const { valid, reasons } = isValidMatch(trip, otherTrip);
            return { otherTrip, valid, reasons };
        })
        .filter(({ valid }) => valid)
        .map(({ otherTrip, reasons }) => buildMatchCard({
            trip,
            otherTrip,
            connection: connectionMap.get(buildPairKey(trip._id, otherTrip._id)),
            viewerId: req.user._id,
            matchReasons: reasons,
            group: groupMap.get(String(otherTrip._id)) ? {
                id: groupMap.get(String(otherTrip._id))._id,
                owner: groupMap.get(String(otherTrip._id)).owner,
                memberCount: (groupMap.get(String(otherTrip._id)).members || []).length,
                isMember: (groupMap.get(String(otherTrip._id)).members || []).some((m) => String(m.user) === String(req.user._id)),
            } : null,
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

exports.updateTrip = catchAsync(async (req, res) => {
    const allowedFields = [
        'arrivalLocation',
        'destination',
        'travelDate',
        'arrivalTime',
        'matchingWindowMinutes',
        'transportType',
        'direction',
        'partnersNeeded',
        'note',
    ];
    const updates = {};

    for (const key of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(req.body, key)) {
            updates[key] = req.body[key];
        }
    }

    if (updates.arrivalLocation && !updates.arrivalLocation.name) {
        return res.status(400).json({ message: 'Arrival location is required.' });
    }

    if (updates.travelDate && !isFutureOrToday(updates.travelDate)) {
        return res.status(400).json({ message: 'Travel date cannot be in the past.' });
    }

    if (updates.arrivalTime) {
        const arrivalTimeMinutes = parseTimeToMinutes(updates.arrivalTime);
        if (arrivalTimeMinutes === null) {
            return res.status(400).json({ message: 'Please enter a valid arrival time.' });
        }
        updates.arrivalTimeMinutes = arrivalTimeMinutes;
    }

    if (updates.arrivalLocation) {
        updates.arrivalLocation = {
            name: updates.arrivalLocation.name.trim(),
            normalizedName: normalizeLocationName(updates.arrivalLocation.name),
            coordinates: updates.arrivalLocation.coordinates || undefined,
        };
    }

    if (updates.destination && updates.destination.name) {
        updates.destination = {
            name: updates.destination.name.trim(),
            normalizedName: normalizeLocationName(updates.destination.name),
            coordinates: updates.destination.coordinates || undefined,
        };
    } else if (Object.prototype.hasOwnProperty.call(updates, 'destination') && !updates.destination?.name) {
        updates.destination = null;
    }

    if (Object.prototype.hasOwnProperty.call(updates, 'matchingWindowMinutes')) {
        updates.matchingWindowMinutes = sanitizeMatchingWindow(updates.matchingWindowMinutes);
    }

    if (Object.prototype.hasOwnProperty.call(updates, 'transportType')) {
        updates.transportType = sanitizeTransportType(updates.transportType);
    }

    if (Object.prototype.hasOwnProperty.call(updates, 'direction')) {
        updates.direction = sanitizeDirection(updates.direction);
    }

    if (Object.prototype.hasOwnProperty.call(updates, 'partnersNeeded')) {
        updates.partnersNeeded = sanitizePartnersNeeded(updates.partnersNeeded);
    }

    if (Object.prototype.hasOwnProperty.call(updates, 'note')) {
        updates.note = sanitizeNote(updates.note);
    }

    const trip = await Trip.findOneAndUpdate(
        { _id: req.params.tripId, user: req.user._id },
        updates,
        { new: true }
    );

    if (!trip) {
        return res.status(404).json({ message: 'Trip not found.' });
    }

    res.status(200).json({ message: 'Trip updated successfully.', trip: formatTrip(trip) });
});

exports.deleteTrip = catchAsync(async (req, res) => {
    const trip = await Trip.findOneAndDelete({ _id: req.params.tripId, user: req.user._id });

    if (!trip) {
        return res.status(404).json({ message: 'Trip not found.' });
    }

    // remove any connections involving this trip
    await Connection.deleteMany({ $or: [{ tripA: trip._id }, { tripB: trip._id }] });

    res.status(200).json({ message: 'Trip deleted.' });
});
