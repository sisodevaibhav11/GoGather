const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/userModel');
const Trip = require('../models/tripModel');
const Connection = require('../models/connectionModel');
const { connectToDatabase } = require('../models/dbConnect');
const { parseTimeToMinutes, normalizeLocationName } = require('./validators');
const { buildPairKey } = require('./tripMatching');

const sampleUsers = [
    {
        name: 'Ananya Sharma',
        email: 'ananya.sharma@example.com',
        photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        mobileNumber: '+919876543210',
        hostel: 'Oakwood Hostel - Room 304',
        profileCompleted: true,
    },
    {
        name: 'Rohan Verma',
        email: 'rohan.verma@example.com',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        mobileNumber: '+919812345678',
        hostel: 'Maple Hall - Room 102',
        profileCompleted: true,
    },
    {
        name: 'Priya Nair',
        email: 'priya.nair@example.com',
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        mobileNumber: '+919988776655',
        hostel: 'Willow Block B',
        profileCompleted: true,
    },
    {
        name: 'Karthik Raja',
        email: 'karthik.raja@example.com',
        photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        mobileNumber: '+919765432109',
        hostel: 'Cedar Heights - Room 405',
        profileCompleted: true,
    },
];

const todayStr = new Date().toISOString().split('T')[0];

const seedData = async () => {
    try {
        console.log('Connecting to database for seeding...');
        await connectToDatabase();

        console.log('Clearing existing sample data...');
        const userEmails = sampleUsers.map((u) => u.email);
        const existingUsers = await User.find({ email: { $in: userEmails } });
        const existingUserIds = existingUsers.map((u) => u._id);

        await Connection.deleteMany({ $or: [{ userA: { $in: existingUserIds } }, { userB: { $in: existingUserIds } }] });
        await Trip.deleteMany({ user: { $in: existingUserIds } });
        await User.deleteMany({ email: { $in: userEmails } });

        console.log('Creating sample users...');
        const createdUsers = await User.create(sampleUsers);
        const uMap = new Map(createdUsers.map((u) => [u.name, u]));

        console.log('Creating sample trips...');
        const tripsData = [
            {
                user: uMap.get('Ananya Sharma')._id,
                arrivalLocation: {
                    name: 'Coimbatore Junction Railway Station',
                    normalizedName: normalizeLocationName('Coimbatore Junction Railway Station'),
                    coordinates: { lat: 11.0018, lng: 76.9629 },
                },
                destination: {
                    name: 'PSG Tech Campus',
                    normalizedName: normalizeLocationName('PSG Tech Campus'),
                    coordinates: { lat: 11.0247, lng: 77.0028 },
                },
                travelDate: todayStr,
                arrivalTime: '18:30',
                arrivalTimeMinutes: parseTimeToMinutes('18:30'),
                matchingWindowMinutes: 45,
                transportType: 'railway',
                direction: 'coming-campus',
                partnersNeeded: 2,
                note: 'Arriving by Kovai Express. Looking for cab share to campus!',
                status: 'waiting',
                shareCode: `tb-seed-ananya`,
            },
            {
                user: uMap.get('Rohan Verma')._id,
                arrivalLocation: {
                    name: 'Coimbatore Junction Railway Station',
                    normalizedName: normalizeLocationName('Coimbatore Junction Railway Station'),
                    coordinates: { lat: 11.0018, lng: 76.9629 },
                },
                destination: {
                    name: 'PSG Tech Campus',
                    normalizedName: normalizeLocationName('PSG Tech Campus'),
                    coordinates: { lat: 11.0247, lng: 77.0028 },
                },
                travelDate: todayStr,
                arrivalTime: '18:45',
                arrivalTimeMinutes: parseTimeToMinutes('18:45'),
                matchingWindowMinutes: 45,
                transportType: 'railway',
                direction: 'coming-campus',
                partnersNeeded: 2,
                note: 'Have two luggage bags. Happy to split Uber/Ola fare.',
                status: 'waiting',
                shareCode: `tb-seed-rohan`,
            },
            {
                user: uMap.get('Priya Nair')._id,
                arrivalLocation: {
                    name: 'Kempegowda International Airport BLR',
                    normalizedName: normalizeLocationName('Kempegowda International Airport BLR'),
                    coordinates: { lat: 13.1986, lng: 77.7066 },
                },
                destination: {
                    name: 'Koramangala 4th Block',
                    normalizedName: normalizeLocationName('Koramangala 4th Block'),
                    coordinates: { lat: 12.9352, lng: 77.6245 },
                },
                travelDate: todayStr,
                arrivalTime: '21:00',
                arrivalTimeMinutes: parseTimeToMinutes('21:00'),
                matchingWindowMinutes: 60,
                transportType: 'airport',
                direction: 'leaving-campus',
                partnersNeeded: 3,
                note: 'Landing at Terminal 1 around 8:45 PM. Heading to Koramangala.',
                status: 'waiting',
                shareCode: `tb-seed-priya`,
            },
            {
                user: uMap.get('Karthik Raja')._id,
                arrivalLocation: {
                    name: 'Gandhipuram Central Bus Stand',
                    normalizedName: normalizeLocationName('Gandhipuram Central Bus Stand'),
                    coordinates: { lat: 11.0168, lng: 76.9679 },
                },
                destination: {
                    name: 'TIDEL Park Coimbatore',
                    normalizedName: normalizeLocationName('TIDEL Park Coimbatore'),
                    coordinates: { lat: 11.0270, lng: 77.0264 },
                },
                travelDate: todayStr,
                arrivalTime: '07:30',
                arrivalTimeMinutes: parseTimeToMinutes('07:30'),
                matchingWindowMinutes: 30,
                transportType: 'bus-stand',
                direction: 'leaving-campus',
                partnersNeeded: 1,
                note: 'Early morning arrival by KSRTC bus. Looking to share auto/cab.',
                status: 'waiting',
                shareCode: `tb-seed-karthik`,
            },
        ];

        const createdTrips = await Trip.create(tripsData);
        console.log(`Created ${createdTrips.length} sample trips.`);

        // Create a mutual connection between Ananya and Rohan for demo
        const tripAnanya = createdTrips.find((t) => t.shareCode === 'tb-seed-ananya');
        const tripRohan = createdTrips.find((t) => t.shareCode === 'tb-seed-rohan');

        if (tripAnanya && tripRohan) {
            const pairKey = buildPairKey(tripAnanya._id, tripRohan._id);
            await Connection.create({
                pairKey,
                tripA: tripAnanya._id,
                tripB: tripRohan._id,
                userA: tripAnanya.user,
                userB: tripRohan.user,
                requestedBy: [tripAnanya.user, tripRohan.user],
                status: 'mutual',
                revealedAt: new Date(),
            });
            console.log('Created sample mutual connection between Ananya and Rohan.');
        }

        console.log('🎉 Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedData();
