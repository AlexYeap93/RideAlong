import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database';
import { CustomError } from '../middleware/errorHandler';

// For Registration of a new user
export const register = async (req: Request, res: Response, next: NextFunction) => {
  
  try {
    const { email, password, name, userType, phone, address, city, province, postalCode } = req.body;
    // Validate email, password, name, and phone are required
    if (!email || !password || !name || !phone) {
      const error: CustomError = new Error('Email, password, name, and phone are required');
      error.statusCode = 400;
      throw error;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const error: CustomError = new Error('Invalid email format');
      error.statusCode = 400;
      throw error;
    }

    // Validate password length of 6 only for now. Special case and capital can be added in future.
    if (password.length < 6) {
      const error: CustomError = new Error('Password must be at least 6 characters long');
      error.statusCode = 400;
      throw error;
    }

    // Normalize email (lowercase, trim)
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (existingUser.rows.length > 0) {
      const error: CustomError = new Error('User with this email already exists');
      error.statusCode = 409;
      throw error;
    }

    // Hash password for the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Determine role
    const role = userType === 'driver' ? 'driver' : 'user';
  
    const finalRole = role;

    // Create user (normalize email, include phone and address if provided)
    const userResult = await query(
      `INSERT INTO users (email, password, name, role, phone, address, city, province, postal_code) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING id, email, name, role, phone, address, city, province, postal_code, created_at`,
      [
        normalizedEmail, 
        hashedPassword, 
        name.trim(), 
        finalRole,
        phone ? phone.trim() : null,
        address ? address.trim() : null,
        city ? city.trim() : null,
        province ? province.trim() : null,
        postalCode ? postalCode.trim() : null
      ]
    );

    const user = userResult.rows[0];

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key';
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: '7d' }
    );

    // If driver, create driver profile
    let driverInfo = null;
    if (userType === 'driver') {
      // Accept both field names for flexibility
      const licenseNumber = req.body.licenseNumber || req.body.driversLicense || req.body.license_number || null;
      const insuranceProof = req.body.insuranceProof || req.body.insurance || req.body.insurance_proof || null;
      const carPhoto = req.body.carPhoto || req.body.car_photo || null;
      const availableSeats = req.body.availableSeats || req.body.numberOfSeats || req.body.available_seats || 4;

      // Validate driver-specific fields
      if (!licenseNumber) {
        const error: CustomError = new Error('License number is required for driver registration');
        error.statusCode = 400;
        throw error;
      }

      const driverResult = await query(
        `INSERT INTO drivers (user_id, license_number, insurance_proof, car_photo, available_seats, is_approved) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
        [user.id, licenseNumber, insuranceProof, carPhoto, parseInt(availableSeats) || 4, false]
      );
      
      driverInfo = driverResult.rows[0];
    }

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          address: user.address,
          city: user.city,
          province: user.province,
          postal_code: user.postal_code,
          driverInfo,
        },
        token: token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  
  try {
    const { email, password } = req.body;
    // Validate email and password are required if not throw error
    if (!email || !password) {
      const error: CustomError = new Error('Email and password are required');
      error.statusCode = 400;
      throw error;
    }

    // Normalize email (lowercase, trim)
    const normalizedEmail = email.trim().toLowerCase();

    // Find user
    const result = await query(
      'SELECT id, email, password, name, role, phone, address, city, province, postal_code FROM users WHERE email = $1',
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      const error: CustomError = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      const error: CustomError = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key';
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: '7d' }
    );

    // Get driver or admin info if applicable
    let driverInfo = null;
    if (user.role === 'driver' || user.role === 'admin') {
      const driverResult = await query(
        'SELECT * FROM drivers WHERE user_id = $1',
        [user.id]
      );
      if (driverResult.rows.length > 0) {
        driverInfo = driverResult.rows[0];
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          address: user.address,
          city: user.city,
          province: user.province,
          postal_code: user.postal_code,
          driverInfo,
        },
        token: token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response,next: NextFunction) => {
  try {
    // In production, invalidate JWT token
    res.status(200).json({
      status: 'success',
      message: 'Logout successful',
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate user is authenticated ( exist in database) if not throw error
    if (!req.user) {
      const error: CustomError = new Error('User not authenticated');
      error.statusCode = 401;
      throw error;
    }

    const result = await query(
      'SELECT id, email, name, role, phone, address, city, province, postal_code, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      const error: CustomError = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const user = result.rows[0];

    // Get driver info if applicable
    let driverInfo = null;
    if (user.role === 'driver' || user.role === 'admin') {
      const driverResult = await query(
        'SELECT * FROM drivers WHERE user_id = $1',
        [user.id]
      );
      if (driverResult.rows.length > 0) {
        driverInfo = driverResult.rows[0];
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          ...user,
          driverInfo,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};







