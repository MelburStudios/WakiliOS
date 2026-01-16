import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import { Error as MongooseError } from 'mongoose';

const handleMongoServerError = (err: any) => {
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return new AppError(`Duplicate ${field}. Please use another value.`, 400);
  }
  return err;
};

const handleValidationError = (err: MongooseError.ValidationError) => {
  const errors = Object.values(err.errors).map(el => el.message);
  return new AppError(`Invalid input data. ${errors.join('. ')}`, 400);
};

export const errorHandler = (
  err: Error | AppError | any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Set default error status
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  let error = { ...err };
  error.message = err.message;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    error = handleValidationError(err);
  }
  if (err.code === 11000) {
    error = handleMongoServerError(err);
  }
  if (err.name === 'CastError') {
    error = new AppError('Invalid ID format', 400);
  }
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token. Please log in again.', 401);
  }
  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token expired. Please log in again.', 401);
  }

  // Development vs Production error response
  if (process.env.NODE_ENV === 'development') {
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      code: error.statusCode,
      stack: err.stack,
      error: err
    });
  }

  // Production error response
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      code: error.statusCode
    });
  }

  // Log unknown errors in production
  console.error('ERROR 💥', err);
  
  // Send generic error for unknown errors in production
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong',
    code: 500
  });
};