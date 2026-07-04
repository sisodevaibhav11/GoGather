const Trip = require('../models/tripModel');
const openai = require('../config/openai');
const catchAsync = require('../utils/catchAsync');
const { getDistanceInKm } = require('../utils/tripMatching');

const AI_SYSTEM_PROMPT = [
    'You are the TravelBuddy AI Travel Assistant.',
    'Help travelers coordinate safely and practically.',
    'Keep answers concise, calm, and mobile-friendly.',
    'Never invent exact station infrastructure when unsure.',
    'If information is uncertain, clearly say it is a best-effort suggestion.',
    'Always include: a meeting-point suggestion, a fare note, and one safety tip when relevant.',
].join(' ');

const buildFallbackAdvice = ({ trip, question, distanceKm }) => {
    const locationName = trip.arrivalLocation.name;
    const destinationName = trip.destination?.name || 'your destination';
    const fareEstimate = distanceKm
        ? `A shared cab for about ${distanceKm.toFixed(1)} km may cost roughly INR ${Math.max(80, Math.round(distanceKm * 18))}-${Math.max(140, Math.round(distanceKm * 28))}.`
        : 'Fare depends on distance and local demand, so confirm in-app or with the driver before starting.';

    if (/delay|late|postpone/i.test(question)) {
        return `Best-effort meeting point: choose a bright, easy-to-spot pickup point near the main entrance at ${locationName}. ${fareEstimate} If you are delayed, message or call your match only after a mutual connection is unlocked, then confirm the revised ETA and avoid rushing alone to a quiet area.`;
    }

    return `Best-effort meeting point: choose a visible pickup zone near the main entrance at ${locationName}, then move together toward ${destinationName}. ${fareEstimate} Safety tip: meet in a busy, well-lit public area and verify the other traveler's name before sharing a ride.`;
};

exports.askAssistant = catchAsync(async (req, res) => {
    const { tripId, question } = req.body;

    if (!tripId || !question?.trim()) {
        return res.status(400).json({ message: 'Trip id and question are required.' });
    }

    const trip = await Trip.findOne({
        _id: tripId,
        user: req.user._id,
    });

    if (!trip) {
        return res.status(404).json({ message: 'Trip not found.' });
    }

    const distanceKm = trip.destination?.coordinates
        ? getDistanceInKm(trip.arrivalLocation.coordinates, trip.destination.coordinates)
        : null;

    const prompt = [
        'Trip context:',
        `Arrival location: ${trip.arrivalLocation.name}`,
        `Destination: ${trip.destination?.name || 'Not provided'}`,
        `Travel date: ${trip.travelDate}`,
        `Arrival time: ${trip.arrivalTime}`,
        `Matching window: ${trip.matchingWindowMinutes} minutes`,
        `Estimated distance: ${distanceKm ? `${distanceKm.toFixed(1)} km` : 'Unknown'}`,
        '',
        'Traveler question:',
        question.trim(),
        '',
        'Answer with three short sections titled Meeting point, Fare, and Advice.',
    ].join('\n');

    if (!openai) {
        return res.status(200).json({
            answer: buildFallbackAdvice({ trip, question, distanceKm }),
            usedFallback: true,
            prompt,
        });
    }

    try {
        const response = await openai.responses.create({
            model: process.env.OPENAI_MODEL || 'gpt-5.4-mini',
            instructions: AI_SYSTEM_PROMPT,
            input: prompt,
            store: false,
        });

        res.status(200).json({
            answer: response.output_text || buildFallbackAdvice({ trip, question, distanceKm }),
            usedFallback: false,
            prompt,
        });
    } catch (error) {
        console.error('AI assist failed:', error.message);
        res.status(200).json({
            answer: buildFallbackAdvice({ trip, question, distanceKm }),
            usedFallback: true,
            prompt,
        });
    }
});
