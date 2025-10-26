export default function errorHandler(err, req, res, next) {
    const status = err.statusCode || 500;

    // If AppError has a messages array, send that; otherwise fallback to message
    const response = Array.isArray(err.messages)
        ? err.messages
        : [err.message || "Internal Server Error"];

    return res.status(status).json({
        errors: response,
    });
}
