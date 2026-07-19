const Trip = require('../models/tripModel');
const catchAsync = require('../utils/catchAsync');
const axios = require('axios');

// Escape user input for use in a MongoDB $regex to avoid ReDoS/regex injection
const escapeRegex = (str) => {
    // Escape characters: . * + ? ^ $ { } ( ) | [ ] \\ 
    return str.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
};

// Simple in-memory cache for geocode results
const geocodeCache = new Map(); // key -> { ts, data }
const GEOCODE_TTL = 10 * 60 * 1000; // 10 minutes
let lastNominatimRequestAt = 0;

async function fetchNominatim(query) {
    const now = Date.now();
    const since = now - lastNominatimRequestAt;
    if (since < 1000) {
        // ensure ~1 request/sec
        await new Promise((resolve) => setTimeout(resolve, 1000 - since));
    }

    lastNominatimRequestAt = Date.now();

    const url = 'https://nominatim.openstreetmap.org/search';
    const { data } = await axios.get(url, {
        params: {
            format: 'json',
            q: query,
            addressdetails: 1,
            limit: 5,
        },
        headers: {
            'User-Agent': 'GoGather/1.0 (+contact@gogather.example)'
        },
        timeout: 5000,
    });

    return data.map((item) => ({
        name: item.display_name,
        coordinates: { lat: Number(item.lat), lng: Number(item.lon) },
    }));
}

exports.getSuggestions = catchAsync(async (req, res) => {
    const rawQuery = (req.query.query || '').trim();

    if (rawQuery.length < 2) {
        return res.status(200).json({ suggestions: [] });
    }

    const safeQuery = escapeRegex(rawQuery);

    const trips = await Trip.find({
        'arrivalLocation.name': { $regex: safeQuery, $options: 'i' },
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

exports.geocode = catchAsync(async (req, res) => {
    const query = (req.query.query || '').trim();

    if (!query || query.length < 2) {
        return res.status(200).json({ results: [] });
    }

    const key = query.toLowerCase();
    const cached = geocodeCache.get(key);
    if (cached && (Date.now() - cached.ts) < GEOCODE_TTL) {
        return res.status(200).json({ results: cached.data });
    }

    const results = await fetchNominatim(query);
    geocodeCache.set(key, { ts: Date.now(), data: results });

    res.status(200).json({ results });
});
