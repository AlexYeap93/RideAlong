import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { CustomError } from '../middleware/errorHandler';
// get all rides
export const getRides = async (req: Request,res: Response,next: NextFunction) => {
  try {
    const { destination, date, driverId } = req.query;
    let sql = `
      SELECT r.*, 
             d.available_seats, 
             d.car_photo,
             u.id as driver_user_id,
             u.name as driver_name,
             u.email as driver_email,
             u.phone as driver_phone,
             u.address as driver_address,
             COUNT(b.id) as booked_seats,
             COALESCE(AVG(rat.rating), 0) as average_rating
      FROM rides r
      JOIN drivers d ON r.driver_id = d.id
      JOIN users u ON d.user_id = u.id
      LEFT JOIN bookings b ON r.id = b.ride_id AND b.status != 'cancelled'
      LEFT JOIN ratings rat ON rat.driver_id = d.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (destination) {
      sql += ` AND r.destination = $${paramCount}`;
      params.push(destination);
      paramCount++;
    }

    if (date) {
      sql += ` AND r.ride_date = $${paramCount}`;
      params.push(date);
      paramCount++;
    }

    if (driverId) {
      sql += ` AND r.driver_id = $${paramCount}`;
      params.push(driverId);
      paramCount++;
    }

    sql += ` GROUP BY r.id, d.available_seats, d.car_photo, u.id, u.name, u.email, u.phone, u.address, d.id
             ORDER BY r.ride_date DESC, r.ride_time DESC`;

    const result = await query(sql, params);
    res.status(200).json({
      status: 'success',
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};
// get a ride by id
export const getRideById = async (req: Request,res: Response,next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT r.*, 
              d.available_seats, 
              d.car_photo,
              u.id as driver_user_id,
              u.name as driver_name,
              u.email as driver_email,
              u.phone as driver_phone,
              u.address as driver_address,
              COUNT(b.id) as booked_seats,
              COALESCE(AVG(rat.rating), 0) as average_rating
       FROM rides r
       JOIN drivers d ON r.driver_id = d.id
       JOIN users u ON d.user_id = u.id
       LEFT JOIN bookings b ON r.id = b.ride_id AND b.status != 'cancelled'
       LEFT JOIN ratings rat ON rat.driver_id = d.id
       WHERE r.id = $1
       GROUP BY r.id, d.available_seats, d.car_photo, u.id, u.name, u.email, u.phone, u.address, d.id`,
      [id]
    );

    if (result.rows.length === 0) {
      const error: CustomError = new Error('Ride not found');
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
// create a ride when driver list a ride
export const createRide = async (req: Request,res: Response,next: NextFunction) => {
  try {
    if (!req.user) {
      const error: CustomError = new Error('Authentication required');
      error.statusCode = 401;
      throw error;
    }

    // Check if user is suspended
    const userCheck = await query('SELECT is_suspended FROM users WHERE id = $1', [req.user.id]);
    if (userCheck.rows.length > 0 && userCheck.rows[0].is_suspended === true) {
      const error: CustomError = new Error('Your account has been suspended. You cannot list rides.');
      error.statusCode = 403;
      throw error;
    }

    const { destination, rideDate, rideTime, price } = req.body;

    if (!destination || !rideDate || !rideTime) {
      const error: CustomError = new Error('Destination, date, and time are required');
      error.statusCode = 400;
      throw error;
    }

    // Get driver ID from user
    // Admin can list rides - check if they have a driver profile, if not create one
    let driverResult = await query(
      'SELECT id FROM drivers WHERE user_id = $1',
      [req.user.id]
    );

    let driverId: string;

    if (driverResult.rows.length === 0) {
      // Admin can create a driver profile automatically
      if (req.user.role === 'admin') {
        const newDriver = await query(
          `INSERT INTO drivers (user_id, license_number, insurance_proof, available_seats, is_approved) 
           VALUES ($1, $2, $3, $4, $5) 
           RETURNING id`,
          [req.user.id, 'ADMIN', 'ADMIN', 4, true]
        );
        driverId = newDriver.rows[0].id;
      } else {
        const error: CustomError = new Error('Driver profile not found or not approved');
        error.statusCode = 404;
        throw error;
      }
    } else {
      // Check if driver is approved (unless admin)
      if (req.user.role !== 'admin') {
        const approvedCheck = await query(
          'SELECT id FROM drivers WHERE user_id = $1 AND is_approved = true',
          [req.user.id]
        );
        if (approvedCheck.rows.length === 0) {
          const error: CustomError = new Error('Driver profile not approved');
          error.statusCode = 403;
          throw error;
        }
      }
      driverId = driverResult.rows[0].id;
    }

    const result = await query(
      `INSERT INTO rides (driver_id, destination, ride_date, ride_time, price, status) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [driverId, destination, rideDate, rideTime, price || null, 'active']
    );

    res.status(201).json({
      status: 'success',
      message: 'Ride created successfully',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};
// update a ride by driver only
export const updateRide = async (req: Request,res: Response,next: NextFunction) => {
  try {
    const { id } = req.params;
    const { destination, rideDate, rideTime, price, status } = req.body;

    // Verify driver owns this ride
    if (req.user) {
      const rideCheck = await query(
        `SELECT r.id FROM rides r
         JOIN drivers d ON r.driver_id = d.id
         WHERE r.id = $1 AND d.user_id = $2`,
        [id, req.user.id]
      );

      if (rideCheck.rows.length === 0 && req.user.role !== 'admin') {
        const error: CustomError = new Error('Unauthorized to update this ride');
        error.statusCode = 403;
        throw error;
      }
    }

    // Check current status before update to prevent double-counting earnings
    const currentRide = await query(
      'SELECT status, driver_id FROM rides WHERE id = $1',
      [id]
    );

    if (currentRide.rows.length === 0) {
      const error: CustomError = new Error('Ride not found');
      error.statusCode = 404;
      throw error;
    }

    const previousStatus = currentRide.rows[0].status;
    const driverId = currentRide.rows[0].driver_id;

    const result = await query(
      `UPDATE rides 
       SET destination = COALESCE($1, destination),
           ride_date = COALESCE($2, ride_date),
           ride_time = COALESCE($3, ride_time),
           price = COALESCE($4, price),
           status = COALESCE($5, status),
           updated_at = NOW()
       WHERE id = $6 
       RETURNING *`,
      [destination, rideDate, rideTime, price, status, id]
    );

    // If marking ride as completed (and it wasn't already completed), 
    // mark all confirmed bookings as completed and add earnings to driver
    if (status === 'completed' && previousStatus !== 'completed') {
      // Mark all confirmed bookings as completed
      await query(
        `UPDATE bookings 
         SET status = 'completed', updated_at = NOW()
         WHERE ride_id = $1 AND status = 'confirmed'`,
        [id]
      );

      // Calculate total earnings from all payments for this ride
      // This includes base price + any additional amounts accepted
      const earningsResult = await query(
        `SELECT COALESCE(SUM(p.amount), 0) as total_earnings
         FROM payments p
         JOIN bookings b ON p.booking_id = b.id
         WHERE b.ride_id = $1 
           AND b.status = 'completed'
           AND p.payment_status = 'completed'`,
        [id]
      );

      const totalEarnings = parseFloat(earningsResult.rows[0].total_earnings) || 0;

      if (driverId && totalEarnings > 0) {
        // Add earnings to driver's total_earnings
        await query(
          `UPDATE drivers 
           SET total_earnings = COALESCE(total_earnings, 0) + $1,
               updated_at = NOW()
           WHERE id = $2`,
          [totalEarnings, driverId]
        );
      }
    }

    res.status(200).json({
      status: 'success',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// delete a ride
export const deleteRide = async (req: Request,res: Response,next: NextFunction) => {
  try {
    const { id } = req.params;

    // Verify driver owns this ride
    if (req.user) {
      const rideCheck = await query(
        `SELECT r.id FROM rides r
         JOIN drivers d ON r.driver_id = d.id
         WHERE r.id = $1 AND d.user_id = $2`,
        [id, req.user.id]
      );

      if (rideCheck.rows.length === 0 && req.user.role !== 'admin') {
        const error: CustomError = new Error('Unauthorized to delete this ride');
        error.statusCode = 403;
        throw error;
      }
    }

    // Cancel all bookings for this ride first (this frees up seats)
    await query(
      `UPDATE bookings 
       SET status = 'cancelled', updated_at = NOW() 
       WHERE ride_id = $1 AND status != 'cancelled'`,
      [id]
    );

    // Refund any payments for cancelled bookings
    await query(
      `UPDATE payments 
       SET payment_status = 'refunded', updated_at = NOW() 
       WHERE booking_id IN (
         SELECT id FROM bookings WHERE ride_id = $1 AND status = 'cancelled'
       ) AND payment_status = 'completed'`,
      [id]
    );

    // Delete the ride
    const result = await query('DELETE FROM rides WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      const error: CustomError = new Error('Ride not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      status: 'success',
      message: 'Ride cancelled successfully. All passenger bookings have been cancelled and refunded.',
    });
  } catch (error) {
    next(error);
  }
};

// get rides by driver
export const getRidesByDriver = async (req: Request,res: Response,next: NextFunction) => {
  try {
    const { driverId } = req.params;
    const result = await query(
      `SELECT r.*, 
              d.available_seats,
              u.id as driver_user_id,
              u.name as driver_name,
              u.address as driver_address,
              u.phone as driver_phone,
              COUNT(b.id) as booked_seats,
              COALESCE(AVG(rat.rating), 0) as average_rating
       FROM rides r
       JOIN drivers d ON r.driver_id = d.id
       JOIN users u ON d.user_id = u.id
       LEFT JOIN bookings b ON r.id = b.ride_id AND b.status != 'cancelled'
       LEFT JOIN ratings rat ON rat.driver_id = d.id
       WHERE r.driver_id = $1
       GROUP BY r.id, d.available_seats, u.id, u.name, u.address, u.phone, d.id
       ORDER BY r.ride_date DESC, r.ride_time DESC`,
      [driverId]
    );

    res.status(200).json({
      status: 'success',
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

// get rides by destination only uofc for now 
export const getRidesByDestination = async (req: Request,res: Response,next: NextFunction) => {
  try {
    const { destination } = req.params;
    const result = await query(
      `SELECT r.*, 
              d.available_seats, 
              d.car_photo,
              u.name as driver_name,
              COUNT(b.id) as booked_seats
       FROM rides r
       JOIN drivers d ON r.driver_id = d.id
       JOIN users u ON d.user_id = u.id
       LEFT JOIN bookings b ON r.id = b.ride_id AND b.status != 'cancelled'
       WHERE r.destination = $1 AND r.status = 'active'
       GROUP BY r.id, d.available_seats, d.car_photo, u.name
       ORDER BY r.ride_date ASC, r.ride_time ASC`,
      [destination]
    );

    res.status(200).json({
      status: 'success',
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};
// get available rides
export const getAvailableRides = async (req: Request,res: Response,next: NextFunction) => {
  try {
    const { destination, date } = req.query;
    let sql = `
      SELECT r.*, 
             d.available_seats, 
             d.car_photo,
             u.id as driver_user_id,
             u.name as driver_name,
             u.address as driver_address,
             u.phone as driver_phone,
             COUNT(b.id) as booked_seats,
             (d.available_seats - COUNT(b.id)) as available_seats_remaining,
             COALESCE(AVG(rat.rating), 0) as average_rating
      FROM rides r
      JOIN drivers d ON r.driver_id = d.id
      JOIN users u ON d.user_id = u.id
      LEFT JOIN bookings b ON r.id = b.ride_id AND b.status != 'cancelled'
      LEFT JOIN ratings rat ON rat.driver_id = d.id
      WHERE r.status = 'active' AND d.is_approved = true
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (destination) {
      sql += ` AND r.destination = $${paramCount}`;
      params.push(destination);
      paramCount++;
    }

    if (date) {
      sql += ` AND r.ride_date = $${paramCount}`;
      params.push(date);
      paramCount++;
    }

    sql += ` GROUP BY r.id, d.available_seats, d.car_photo, u.id, u.name, u.address, u.phone, d.id
             HAVING (d.available_seats - COUNT(b.id)) > 0
             ORDER BY r.ride_date ASC, r.ride_time ASC`;

    const result = await query(sql, params);
    res.status(200).json({
      status: 'success',
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};









