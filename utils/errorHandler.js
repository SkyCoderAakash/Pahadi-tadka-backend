const errorHandler = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;

    Error.captureStackTrace(error, errorHandler);

    return error;
};

export default errorHandler