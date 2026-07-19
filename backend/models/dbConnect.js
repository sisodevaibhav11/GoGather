const mongoose = require('mongoose');

const DB = process.env.MONGODB_URI || process.env.DB_URL || 'mongodb://127.0.0.1:27017/gogather';

mongoose.set('bufferCommands', false);

let connectionPromise = null;

const makeDbError = (message, originalError) => {
    const error = new Error(message);
    error.statusCode = 503;
    error.cause = originalError;
    return error;
};

const connectToDatabase = async () => {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (!connectionPromise) {
        connectionPromise = mongoose.connect(DB, {
            serverSelectionTimeoutMS: 5000,
            autoIndex: true,
        }).then((connection) => {
            console.log('DB connection established');
            return connection;
        }).catch((error) => {
            connectionPromise = null;
            console.warn('DB CONNECTION FAILED');
            console.warn('ERR:', error.message);
            throw makeDbError(
                'Database connection failed. Check MONGODB_URI / DB_URL and redeploy once it is fixed.',
                error
            );
        });
    }

    return connectionPromise;
};

connectToDatabase().catch(() => {});

module.exports = {
    connectToDatabase,
};
