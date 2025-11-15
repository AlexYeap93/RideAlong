import { Request, Response, NextFunction } from 'express';

export interface CustomError extends Error {
  statusCode?: number;
  status?: string;
}

export const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction) => {
const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  // Log error with more context
  console.error('Error:', {
    message: err.message,
    statusCode,
    path: req.path,
    method: req.method,
    body: req.body,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });

  // Don't send stack trace in production
  const response: any = {
    status,
    message: err.message || 'Internal server error',
  };

  // Only include error details in development
  if (process.env.NODE_ENV === 'development') {
    response.error = err.message;
    if (err.stack) {
      response.stack = err.stack;
    }
  }

  res.status(statusCode).json(response);
};







