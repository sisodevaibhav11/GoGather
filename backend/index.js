const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const PORT = process.env.PORT || 8080;

const requiredJwt = process.env.JWT_SECRET;
const requiredDb = process.env.MONGODB_URI || process.env.DB_URL;
if (!requiredJwt || !requiredDb) {
    console.error('Missing required environment variables. Please set JWT_SECRET and MONGODB_URI (or DB_URL).');
    process.exit(1);
}

require('./models/dbConnect');
const authRoutes = require('./routes/authRoutes');
const tripRoutes = require('./routes/tripRoutes');
const connectionRoutes = require('./routes/connectionRoutes');
const reportRoutes = require('./routes/reportRoutes');
const locationRoutes = require('./routes/locationRoutes');
const aiRoutes = require('./routes/aiRoutes');
const groupRoutes = require('./routes/groupRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || origin === FRONTEND_URL) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'GoGather Backend is running 🚀',
    });
});

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/ai-assist', aiRoutes);
app.use('/api/groups', groupRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});

