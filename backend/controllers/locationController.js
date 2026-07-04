const Trip = require('../models/tripModel');
const catchAsync = require('../utils/catchAsync');

exports.getSuggestions = catchAsync(async (req, res) => {
    const query = (req.query.query || '').trim();

    if (query.length < 2) {
        return res.status(200).json({ suggestions: [] });
    }

    const trips = await Trip.find({
        'arrivalLocation.name': { $regex: query, $options: 'i' },
    })
        .select('arrivalLocation')
        .limit(8);

    const suggestions = Array.from(new Map(
        trips.map((trip) => [trip.arrivalLocation.name.toLowerCase(), {
            name: trip.arrivalLocation.name,
            coordinates: trip.arrivalLocation.coordinates || null,
        }])
    ).values());

    res.status(200).json({ suggestions });
});
