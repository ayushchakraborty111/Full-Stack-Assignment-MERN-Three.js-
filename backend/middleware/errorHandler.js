class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}


const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    err = new AppError(message, 400);
  }

  if (err.code === 11000) {
    const message = `Duplicate field value entered`;
    err = new AppError(message, 400);
  }

  if (err.name === "JsonWebTokenError") {
    const message = `Invalid token`;
    err = new AppError(message, 401);
  }

  if (err.name === "TokenExpiredError") {
    const message = `Token has expired`;
    err = new AppError(message, 401);
  }

  if (err.name === "MulterError") {
    let message = "File upload error";
    if (err.code === "LIMIT_FILE_SIZE") {
      message = "File size exceeds the maximum limit";
    } else if (err.code === "LIMIT_FILE_COUNT") {
      message = "Too many files uploaded";
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      message = "Unexpected field";
    }
    err = new AppError(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    statusCode: err.statusCode,
    message: err.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

const catchAsyncErrors = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { errorHandler, AppError, catchAsyncErrors };
