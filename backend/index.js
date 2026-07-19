const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const PORT = process.env.PORT || 8080;
const extraOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildVercelPreviewPattern = (origin) => {
    try {
        const url = new URL(origin);
        if (url.protocol !== 'https:' || !url.hostname.endsWith('.vercel.app')) {
            return null;
        }

        const baseLabel = url.hostname.replace(/\.vercel\.app$/i, '');
        if (!baseLabel) {
            return null;
        }

        return new RegExp(`^https://${escapeRegExp(baseLabel)}(?:-[a-z0-9-]+)?\\.vercel\\.app$`, 'i');
    } catch {
        return null;
    }
};

const jwtSecret = process.env.JWT_SECRET || 'dev-jwt-secret';
const dbUrl = process.env.MONGODB_URI || process.env.DB_URL || 'mongodb://127.0.0.1:27017/gogather';

process.env.JWT_SECRET = jwtSecret;
process.env.MONGODB_URI = dbUrl;

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'dev-jwt-secret') {
    console.warn('JWT_SECRET not set. Using a development fallback secret.');
}
if (!process.env.MONGODB_URI || process.env.MONGODB_URI === 'mongodb://127.0.0.1:27017/gogather') {
    console.warn('MongoDB URI not set. Using a local fallback URL.');
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

const mountRouteGroup = (path, router) => {
    app.use(`/api${path}`, router);
    app.use(path, router);
};

const allowedOrigins = new Set([
    FRONTEND_URL,
    ...extraOrigins,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
]);

const allowedOriginPatterns = [
    buildVercelPreviewPattern(FRONTEND_URL),
    ...extraOrigins.map(buildVercelPreviewPattern),
].filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        const matchesAllowedPattern = allowedOriginPatterns.some((pattern) => pattern.test(origin || ''));
        if (!origin || allowedOrigins.has(origin) || matchesAllowedPattern || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
            return callback(null, true);
        }

        console.warn(
            `[CORS] Blocked request from origin "${origin}". ` +
            `Currently allowed origins: ${[...allowedOrigins].join(', ') || '(none)'}. ` +
            `Allowed origin patterns: ${allowedOriginPatterns.map((pattern) => pattern.toString()).join(', ') || '(none)'}`
        );
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
};

if (!process.env.FRONTEND_URL) {
    console.warn(
        '[startup] FRONTEND_URL is not set. CORS will only allow localhost by default, ' +
        'which will block your deployed frontend. Set FRONTEND_URL to your exact deployed ' +
        'frontend URL (e.g. https://your-frontend.vercel.app, no trailing slash) in this ' +
        'project\'s Vercel Environment Variables, then redeploy.'
    );
}
console.log(`[startup] Allowed CORS origins: ${[...allowedOrigins].join(', ')}`);
console.log(`[startup] Allowed CORS origin patterns: ${allowedOriginPatterns.map((pattern) => pattern.toString()).join(', ') || '(none)'}`);

app.use(cors(corsOptions));
app.options(/(.*)/, cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'GoGather Backend is running',
    });
});

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

mountRouteGroup('/auth', authRoutes);
mountRouteGroup('/trips', tripRoutes);
mountRouteGroup('/connections', connectionRoutes);
mountRouteGroup('/reports', reportRoutes);
mountRouteGroup('/locations', locationRoutes);
mountRouteGroup('/ai-assist', aiRoutes);
mountRouteGroup('/groups', groupRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on ${PORT}`);
    });
}

module.exports = app;
