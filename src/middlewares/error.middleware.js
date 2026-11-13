
const multer = require('multer');

const errorHandler = (error, req, res, next) => {
    console.error(error);

    if (res.headersSent) {
        return next(error);
    }

    const isProduction = process.env.NODE_ENV === 'production';

    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({
                success: false,
                message: 'File too large. Maximum allowed file size is 2 MB.'
            });
        }

        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Maximum 5 files are allowed.'
            });
        }

        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: 'Unexpected file field. Use document or documents.'
            });
        }

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }

    if (error.statusCode === 415) {
        return res.status(415).json({
            success: false,
            message: error.message || 'Unsupported file type'
        });
    }

    if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map((item) => ({
            field: item.path,
            message: item.message
        }));

        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    if (error.code === 11000) {
        const field = Object.keys(error.keyPattern || {})[0] || 'field';

        return res.status(409).json({
            success: false,
            message: `Duplicate value for ${field}`,
            errors: [
                {
                    field,
                    message: `${field} already exists`
                }
            ]
        });
    }

    if (error.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'Invalid value provided',
            errors: [
                {
                    field: error.path,
                    message: error.message
                }
            ]
        });
    }

    if (
        error instanceof SyntaxError &&
        error.status === 400 &&
        'body' in error
    ) {
        return res.status(400).json({
            success: false,
            message: 'Invalid JSON request body'
        });
    }

    const statusCode =
        error.statusCode >= 400 && error.statusCode < 500
            ? error.statusCode
            : error.status >= 400 && error.status < 500
                ? error.status
                : 500;

    const response = {
        success: false,
        message: statusCode === 500
            ? 'Internal server error'
            : error.message
    };

    if (!isProduction) {
        response.stack = error.stack;
    }

    return res.status(statusCode).json(response);
};

module.exports = errorHandler;
