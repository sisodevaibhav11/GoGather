const { normalizeLocationName } = require('./validators');

const toRadians = (value) => (value * Math.PI) / 180;

const getDistanceInKm = (start, end) => {
    if (
        !Number.isFinite(start?.lat) ||
        !Number.isFinite(start?.lng) ||
        !Number.isFinite(end?.lat) ||
        !Number.isFinite(end?.lng)
    ) {
        return null;
    }

    const earthRadiusKm = 6371;
    const latDiff = toRadians(end.lat - start.lat);
    const lngDiff = toRadians(end.lng - start.lng);

    const a = Math.sin(latDiff / 2) ** 2 +
        Math.cos(toRadians(start.lat)) *
        Math.cos(toRadians(end.lat)) *
        Math.sin(lngDiff / 2) ** 2;

    return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const locationsMatch = (first, second) => {
    const distanceKm = getDistanceInKm(first?.coordinates, second?.coordinates);

    if (distanceKm !== null) {
        return distanceKm <= 3;
    }

    const firstName = normalizeLocationName(first?.name);
    const secondName = normalizeLocationName(second?.name);
    return Boolean(firstName && firstName === secondName);
};

const buildTimeDifferenceLabel = (minutesDifference) => {
    if (minutesDifference === 0) {
        return 'Arriving at the same time as you';
    }

    if (minutesDifference < 0) {
        return `Arriving ${Math.abs(minutesDifference)} min before you`;
    }

    return `Arriving ${minutesDifference} min after you`;
};

const buildPairKey = (tripIdA, tripIdB) => [String(tripIdA), String(tripIdB)].sort().join(':');

const getConnectionState = (connection, viewerId) => {
    if (!connection) {
        return {
            status: 'none',
            requestedByMe: false,
            requestedByThem: false,
            contactUnlocked: false,
        };
    }

    const requestedByIds = (connection.requestedBy || []).map((item) => String(item));
    const requestedByMe = requestedByIds.includes(String(viewerId));

    return {
        status: connection.status,
        requestedByMe,
        requestedByThem: requestedByIds.length > 0 && !requestedByMe,
        contactUnlocked: connection.status === 'mutual',
    };
};

module.exports = {
    getDistanceInKm,
    locationsMatch,
    buildTimeDifferenceLabel,
    buildPairKey,
    getConnectionState,
};
