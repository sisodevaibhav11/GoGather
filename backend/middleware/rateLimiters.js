const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = require("express-rate-limit");

exports.tripCreationLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) =>
        String(req.user?._id || ipKeyGenerator(req)),
    message: {
        message: "Trip creation limit reached for today. Please try again tomorrow.",
    },
});