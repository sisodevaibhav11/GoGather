const mongoose = require('mongoose');

const DB = process.env.MONGODB_URI || process.env.DB_URL || 'mongodb://127.0.0.1:27017/gogather';

const connectToDatabase = async () => {
    try {
        await mongoose.connect(DB, {
            serverSelectionTimeoutMS: 5000,
            autoIndex: true,
        });
        console.log('DB connection established');
    } catch (err) {
        console.warn('DB CONNECTION FAILED');
        console.warn('ERR:', err.message);
    }
};

connectToDatabase();
