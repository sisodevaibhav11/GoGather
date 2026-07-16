exports.notFoundHandler = (req, res) => {
    res.status(404).json({
        message: `Route not found: ${req.originalUrl}`,
    });
};

exports.errorHandler = (error, req, res, next) => {
    console.error(error);

    res.status(error.statusCode || 500).json({
        message: error.message || 'Something went wrong.',
    });
};
