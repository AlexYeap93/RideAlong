import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../config/database';
import { CustomError } from '../middleware/errorHandler';

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await query(
      `SELECT u.id, u.email, u.name, u.role, u.is_suspended, u.phone, u.address, u.created_at,
              d.id as driver_id,
              CASE 
                WHEN d.id IS NOT NULL THEN 
                  CAST(ROUND(AVG(rat.rating)::numeric, 1) AS DECIMAL(3,1))
                ELSE NULL
              END as average_rating,
              COALESCE((
                SELECT COUNT(*) 
                FROM rides r 
                WHERE r.driver_id = d.id AND r.status = 'completed'
              ), 0) as total_rides_offered
       FROM users u
       LEFT JOIN drivers d ON u.id = d.user_id
       LEFT JOIN ratings rat ON rat.driver_id = d.id
       GROUP BY u.id, u.email, u.name, u.role, u.is_suspended, u.phone, u.address, u.created_at, d.id
       ORDER BY u.created_at DESC`
    );
    res.status(200).json({
      status: 'success',
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    // Users can only view their own profile unless they're admin
    if (req.user && req.user.id !== id && req.user.role !== 'admin') {
      const error: CustomError = new Error('Unauthorized to view this user');
      error.statusCode = 403;
      throw error;
    }

    const result = await query(
      'SELECT id, email, name, role, is_suspended, phone, address, created_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      const error: CustomError = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      status: 'success',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, city, province, postalCode } = req.body;

    // Users can only update their own profile unless they're admin
    if (req.user && req.user.id !== id && req.user.role !== 'admin') {
      const error: CustomError = new Error('Unauthorized to update this user');
      error.statusCode = 403;
      throw error;
    }

    // Validate required fields
    if (name !== undefined && !name.trim()) {
      const error: CustomError = new Error('Name is required');
      error.statusCode = 400;
      throw error;
    }

    if (email !== undefined) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        const error: CustomError = new Error('Invalid email format');
        error.statusCode = 400;
        throw error;
      }

      // Check if email is already taken by another user
      const normalizedEmail = email.trim().toLowerCase();
      const emailCheck = await query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [normalizedEmail, id]
      );
      if (emailCheck.rows.length > 0) {
        const error: CustomError = new Error('Email is already in use');
        error.statusCode = 409;
        throw error;
      }
    }

    // Validate phone number format if provided
    if (phone !== undefined && phone) {
      const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
      if (!phoneRegex.test(phone.trim())) {
        const error: CustomError = new Error('Invalid phone number format');
        error.statusCode = 400;
        throw error;
      }
    }


    // Normalize email if provided
    const normalizedEmail = email !== undefined ? email.trim().toLowerCase() : undefined;

    const result = await query(
      `UPDATE users 
       SET name = COALESCE($1, name), 
           email = COALESCE($2, email), 
           phone = COALESCE($3, phone),
           address = COALESCE($4, address),
           city = COALESCE($5, city),
           province = COALESCE($6, province),
           postal_code = COALESCE($7, postal_code),
           updated_at = NOW() 
       WHERE id = $8 
       RETURNING id, email, name, role, is_suspended, address, city, province, postal_code, phone, updated_at`,
      [
        name !== undefined ? name.trim() : null,
        normalizedEmail !== undefined ? normalizedEmail : null,
        phone !== undefined ? (phone ? phone.trim() : null) : null,
        address !== undefined ? (address ? address.trim() : null) : null,
        city !== undefined ? (city ? city.trim() : null) : null,
        province !== undefined ? (province ? province.trim() : null) : null,
        postalCode !== undefined ? (postalCode ? postalCode.trim() : null) : null,
        id
      ]
    );

    if (result.rows.length === 0) {
      const error: CustomError = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      status: 'success',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // Users can only delete their own account unless they're admin
    if (req.user && req.user.id !== id && req.user.role !== 'admin') {
      const error: CustomError = new Error('Unauthorized to delete this user');
      error.statusCode = 403;
      throw error;
    }

    const result = await query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      const error: CustomError = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getUserRides = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // Users can only view their own rides unless they're admin
    if (req.user && req.user.id !== id && req.user.role !== 'admin') {
      const error: CustomError = new Error('Unauthorized to view these rides');
      error.statusCode = 403;
      throw error;
    }

    const result = await query(
      `SELECT b.*, r.*, d.available_seats, d.car_photo
       FROM bookings b
       JOIN rides r ON b.ride_id = r.id
       JOIN drivers dr ON r.driver_id = dr.id
       JOIN users u ON dr.user_id = u.id
       LEFT JOIN drivers d ON r.driver_id = d.id
       WHERE b.user_id = $1
       ORDER BY r.ride_date DESC, r.ride_time DESC`,
      [id]
    );

    res.status(200).json({
      status: 'success',
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const suspendUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      const error: CustomError = new Error('Admin access required');
      error.statusCode = 403;
      throw error;
    }

    const { id } = req.params;

    // Prevent suspending admins
    const userCheck = await query('SELECT role FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
      const error: CustomError = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    if (userCheck.rows[0].role === 'admin') {
      const error: CustomError = new Error('Cannot suspend admin users');
      error.statusCode = 400;
      throw error;
    }

    const result = await query(
      `UPDATE users 
       SET is_suspended = TRUE, updated_at = NOW() 
       WHERE id = $1 
       RETURNING id, email, name, role, is_suspended`,
      [id]
    );

    res.status(200).json({
      status: 'success',
      message: 'User suspended successfully',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const unsuspendUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      const error: CustomError = new Error('Admin access required');
      error.statusCode = 403;
      throw error;
    }

    const { id } = req.params;

    const result = await query(
      `UPDATE users 
       SET is_suspended = FALSE, updated_at = NOW() 
       WHERE id = $1 
       RETURNING id, email, name, role, is_suspended`,
      [id]
    );

    if (result.rows.length === 0) {
      const error: CustomError = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      status: 'success',
      message: 'User unsuspended successfully',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { currentPassword, oldPassword, newPassword } = req.body;
    
    const currentPwd = currentPassword || oldPassword;

    if (req.user && req.user.id !== id && req.user.role !== 'admin') {
      const error: CustomError = new Error('Unauthorized to update this password');
      error.statusCode = 403;
      throw error;
    }
    if (!currentPwd || !newPassword) {
      const error: CustomError = new Error('Current password and new password are required');
      error.statusCode = 400;
      throw error;
    }

    if (newPassword.length < 8) {
      const error: CustomError = new Error('New password must be at least 8 characters long');
      error.statusCode = 400;
      throw error;
    }
    //validate
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      const error: CustomError = new Error('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      error.statusCode = 400;
      throw error;
    }

    const userResult = await query(
      'SELECT id, password FROM users WHERE id = $1',
      [id]
    );

    if (userResult.rows.length === 0) {
      const error: CustomError = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const user = userResult.rows[0];


    if (req.user?.role !== 'admin') {
      const isPasswordValid = await bcrypt.compare(currentPwd, user.password);
      if (!isPasswordValid) {
        const error: CustomError = new Error('Current password is incorrect');
        error.statusCode = 401;
        throw error;
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
      [hashedPassword, id]
    );

    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
};









