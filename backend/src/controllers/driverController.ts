import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { CustomError } from '../middleware/errorHandler';

// list all drivers
export const getDrivers = async (req: Request,res: Response,next: NextFunction) => {
  try {
    // If user is admin, return all drivers (including unapproved)
    // Otherwise, return only approved drivers
    const isAdmin = req.user && req.user.role === 'admin';
    const whereClause = isAdmin ? '1=1' : 'd.is_approved = true';
    
    const result = await query(
      `SELECT d.*, u.name, u.email, u.role, u.id as user_id
       FROM drivers d
       JOIN users u ON d.user_id = u.id
       WHERE ${whereClause}
       ORDER BY u.name ASC`
    );
    res.status(200).json({
      status: 'success',
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

// get my driver profile
export const getMyDriverProfile = async ( req: Request,res: Response,next: NextFunction) => {
  try {
    if (!req.user) {
      const error: CustomError = new Error('Authentication required');
      error.statusCode = 401;
      throw error;
    }

    // Check if user is suspended
    const userCheck = await query('SELECT is_suspended FROM users WHERE id = $1', [req.user.id]);
    if (userCheck.rows.length > 0 && userCheck.rows[0].is_suspended === true) {
      const error: CustomError = new Error('Your account has been suspended. You cannot access driver profile.');
      error.statusCode = 403;
      throw error;
    }

    const result = await query(
      `SELECT d.*, 
              u.name, 
              u.email, 
              u.role,
              COALESCE(AVG(rat.rating), 0) as average_rating
       FROM drivers d
       JOIN users u ON d.user_id = u.id
       LEFT JOIN ratings rat ON rat.driver_id = d.id
       WHERE d.user_id = $1
       GROUP BY d.id, u.name, u.email, u.role`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      const error: CustomError = new Error('Driver profile not found');
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

// get a driver by id
export const getDriverById = async (req: Request,res: Response,next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT d.*, u.name, u.email, u.role
       FROM drivers d
       JOIN users u ON d.user_id = u.id
       WHERE d.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      const error: CustomError = new Error('Driver not found');
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

// create a driver profile
export const createDriver = async (req: Request,res: Response,next: NextFunction) => {
  try {
    if (!req.user) {
      const error: CustomError = new Error('Authentication required');
      error.statusCode = 401;
      throw error;
    }

    const { licenseNumber, insuranceProof, carPhoto, availableSeats } = req.body;

    if (!licenseNumber || !insuranceProof || !availableSeats) {
      const error: CustomError = new Error('License number, insurance proof, and available seats are required');
      error.statusCode = 400;
      throw error;
    }

    // Check if driver profile already exists
    const existingDriver = await query(
      'SELECT id FROM drivers WHERE user_id = $1',
      [req.user.id]
    );

    if (existingDriver.rows.length > 0) {
      const error: CustomError = new Error('Driver profile already exists');
      error.statusCode = 409;
      throw error;
    }

    // Update user role to driver if not already
    await query(
      'UPDATE users SET role = $1 WHERE id = $2 AND role != $3',
      ['driver', req.user.id, 'admin']
    );

    const result = await query(
      `INSERT INTO drivers (user_id, license_number, insurance_proof, car_photo, available_seats, is_approved) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [req.user.id, licenseNumber, insuranceProof, carPhoto || null, availableSeats, false]
    );

    res.status(201).json({
      status: 'success',
      message: 'Driver profile created successfully. Waiting for approval.',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// update a driver profile
export const updateDriver = async (req: Request,res: Response,next: NextFunction) => {
  try {
    const { id } = req.params;
    const { licenseNumber, insuranceProof, carPhoto, availableSeats } = req.body;

    // Drivers can only update their own profile unless admin
    if (req.user && req.user.role !== 'admin') {
      const driverCheck = await query('SELECT user_id FROM drivers WHERE id = $1', [id]);
      if (driverCheck.rows.length === 0 || driverCheck.rows[0].user_id !== req.user.id) {
        const error: CustomError = new Error('Unauthorized to update this driver');
        error.statusCode = 403;
        throw error;
      }
    }

    const result = await query(
      `UPDATE drivers 
       SET license_number = COALESCE($1, license_number),
           insurance_proof = COALESCE($2, insurance_proof),
           car_photo = COALESCE($3, car_photo),
           available_seats = COALESCE($4, available_seats),
           updated_at = NOW()
       WHERE id = $5 
       RETURNING *`,
      [licenseNumber, insuranceProof, carPhoto, availableSeats, id]
    );

    if (result.rows.length === 0) {
      const error: CustomError = new Error('Driver not found');
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

// delete a driver profile
export const deleteDriver = async (req: Request,res: Response,next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM drivers WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      const error: CustomError = new Error('Driver not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      status: 'success',
      message: 'Driver deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// get driver rides
export const getDriverRides = async (req: Request,res: Response,next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT r.*, COUNT(b.id) as booked_seats
       FROM rides r
       LEFT JOIN bookings b ON r.id = b.ride_id AND b.status != 'cancelled'
       WHERE r.driver_id = $1
       GROUP BY r.id
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

// approve a driver For admin only
export const approveDriver = async (req: Request,res: Response,next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Get driver info first
    const driverResult = await query(
      'SELECT user_id FROM drivers WHERE id = $1',
      [id]
    );

    if (driverResult.rows.length === 0) {
      const error: CustomError = new Error('Driver not found');
      error.statusCode = 404;
      throw error;
    }

    const userId = driverResult.rows[0].user_id;

    // Update driver approval status
    const result = await query(
      `UPDATE drivers 
       SET is_approved = true, updated_at = NOW() 
       WHERE id = $1 
       RETURNING *`,
      [id]
    );

    // Update user role to driver (if not already admin)
    await query(
      `UPDATE users 
       SET role = 'driver', updated_at = NOW() 
       WHERE id = $1 AND role != 'admin'`,
      [userId]
    );

    res.status(200).json({
      status: 'success',
      message: 'Driver approved successfully',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};







