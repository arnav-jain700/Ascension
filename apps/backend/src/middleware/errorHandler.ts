import { Request, Response, NextFunction } from "express";

export interface ApiError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(err);

  // Prisma errors
  if (err.name === "PrismaClientKnownRequestError") {
    const prismaError = err as any;
    switch (prismaError.code) {
      case "P2002":
        // Unique constraint violation
        const field = prismaError.meta?.target?.[0] || "field";
        error.statusCode = 400;
        error.message = `${field} already exists`;
        break;
      case "P2025":
        // Record not found
        error.statusCode = 404;
        error.message = "Record not found";
        break;
      case "P2003":
        // Foreign key constraint violation
        error.statusCode = 400;
        error.message = "Invalid reference";
        break;
      default:
        error.statusCode = 400;
        error.message = "Database error";
    }
  }

  // Validation errors
  if (err.name === "ValidationError") {
    error.statusCode = 400;
    error.message = "Validation failed";
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error.statusCode = 401;
    error.message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    error.statusCode = 401;
    error.message = "Token expired";
  }

  // Multer errors
  if (err.name === "MulterError") {
    const multerError = err as any;
    switch (multerError.code) {
      case "LIMIT_FILE_SIZE":
        error.statusCode = 400;
        error.message = "File too large";
        break;
      case "LIMIT_FILE_COUNT":
        error.statusCode = 400;
        error.message = "Too many files";
        break;
      case "LIMIT_UNEXPECTED_FILE":
        error.statusCode = 400;
        error.message = "Unexpected file field";
        break;
      default:
        error.statusCode = 400;
        error.message = "File upload error";
    }
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  // Don't expose stack trace in production
  const isDevelopment = process.env.NODE_ENV === "development";

  res.status(statusCode).json({
    success: false,
    error: error.name || "Error",
    message,
    ...(isDevelopment && { stack: error.stack }),
    ...(req.originalUrl && { path: req.originalUrl }),
    ...(req.method && { method: req.method }),
  });
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Route ${req.originalUrl} not found`) as ApiError;
  error.statusCode = 404;
  next(error);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
