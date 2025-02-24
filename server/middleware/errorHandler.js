const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    // MongoDB duplicate key error
    if (err.code === 11000) {
        return res.status(400).json({
            error: 'Duplicate value entered',
            field: Object.keys(err.keyPattern)[0]
        });
    }

    // MongoDB validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(error => error.message);
        return res.status(400).json({ errors });
    }

    // JWT authentication error
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token' });
    }

    // JWT token expired error
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
    }

    // Default error
    res.status(err.status || 500).json({
        error: err.message || 'Something went wrong on the server'
    });
};

module.exports = errorHandler; 