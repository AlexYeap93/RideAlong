import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
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

interface JwtPayload {
  id: string;
  email: string;
  role: 'user' | 'driver' | 'admin';
  iat?: number;
  exp?: number;
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error: CustomError = new Error('Authentication required');
      error.statusCode = 401;
      throw error;
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      const error: CustomError = new Error('Authentication required');
      error.statusCode = 401;
      throw error;
    }

    // Verify JWT token
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key';
    
    try {
      const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
      
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };

      next();
    } catch (jwtError) {
      const error: CustomError = new Error('Invalid or expired authentication token');
      error.statusCode = 401;
      throw error;
    }
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









