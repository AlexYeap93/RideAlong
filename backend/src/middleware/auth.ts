import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { CustomError } from './errorHandler';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: 'user' | 'driver' | 'admin';
      };
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // For now, we'll use a simple token-based auth. The token is just the user id.
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      const error: CustomError = new Error('Authentication required');
      error.statusCode = 401;
      throw error;
    }

    // Verify token and get user 
    const result = await query(
      'SELECT id, email, role FROM users WHERE id = $1',
      [token]
    );

    if (result.rows.length === 0) {
      const error: CustomError = new Error('Invalid authentication token');
      error.statusCode = 401;
      throw error;
    }

    req.user = {
      id: result.rows[0].id,
      email: result.rows[0].email,
      role: result.rows[0].role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    const error: CustomError = new Error('Admin access required');
    error.statusCode = 403;
    return next(error);
  }
  next();
};

export const requireDriver = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || (req.user.role !== 'driver' && req.user.role !== 'admin')) {
    const error: CustomError = new Error('Driver access required');
    error.statusCode = 403;
    return next(error);
  }
  next();
};









