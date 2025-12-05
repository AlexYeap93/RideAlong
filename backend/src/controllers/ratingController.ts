import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { CustomError } from '../middleware/errorHandler';

// Create a rating for a driver
export const createRating = async (req: Request,res: Response,next: NextFunction) => {
  try {
    if (!req.user) {
      const error: CustomError = new Error('Authentication required');
      error.statusCode = 401;
      throw error;
    }

    // Check if user is suspended
    const userCheck = await query('SELECT is_suspended FROM users WHERE id = $1', [req.user.id]);
    if (userCheck.rows.length > 0 && userCheck.rows[0].is_suspended === true) {
      const error: CustomError = new Error('Your account has been suspended. You cannot rate drivers.');
      error.statusCode = 403;
      throw error;
    }

    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating) {
      const error: CustomError = new Error('Booking ID and rating are required');
      error.statusCode = 400;
      throw error;
    }

    if (rating < 1 || rating > 5) {
      const error: CustomError = new Error('Rating must be between 1 and 5');
      error.statusCode = 400;
      throw error;
    }

    // Verify booking belongs to user and is completed
    const bookingCheck = await query(
      `SELECT b.*, r.driver_id, r.id as ride_id
       FROM bookings b
       JOIN rides r ON b.ride_id = r.id
       WHERE b.id = $1 AND b.user_id = $2 AND b.status = 'completed'`,
      [bookingId, req.user.id]
    );

    if (bookingCheck.rows.length === 0) {
      const error: CustomError = new Error('Booking not found, not yours, or not completed');
      error.statusCode = 404;
      throw error;
    }

    const booking = bookingCheck.rows[0];

    // Check if rating already exists
    const existingRating = await query(
      'SELECT id FROM ratings WHERE booking_id = $1 AND user_id = $2',
      [bookingId, req.user.id]
    );

    if (existingRating.rows.length > 0) {
      const error: CustomError = new Error('You have already rated this ride');
      error.statusCode = 400;
      throw error;
    }

    // Create rating
    const result = await query(
      `INSERT INTO ratings (booking_id, user_id, driver_id, ride_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [bookingId, req.user.id, booking.driver_id, booking.ride_id, rating, comment || null]
    );

    res.status(201).json({
      status: 'success',
      message: 'Rating submitted successfully',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// Get average ratings for a driver
export const getDriverRatings = async (req: Request,res: Response,next: NextFunction) => {
  try {
    const { driverId } = req.params;

    const result = await query(
      `SELECT r.*, 
              u.name as user_name,
              b.id as booking_id
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       JOIN bookings b ON r.booking_id = b.id
       WHERE r.driver_id = $1
       ORDER BY r.created_at DESC`,
      [driverId]
    );

    // Calculate average rating
    const avgResult = await query(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as total_ratings FROM ratings WHERE driver_id = $1',
      [driverId]
    );

    res.status(200).json({
      status: 'success',
      data: {
        ratings: result.rows,
        averageRating: parseFloat(avgResult.rows[0]?.avg_rating || '0'),
        totalRatings: parseInt(avgResult.rows[0]?.total_ratings || '0'),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get rating for a specific booking
export const getRatingByBooking = async (req: Request,res: Response,next: NextFunction) => {
  try {
    if (!req.user) {
      const error: CustomError = new Error('Authentication required');
      error.statusCode = 401;
      throw error;
    }

    const { bookingId } = req.params;

    const result = await query(
      `SELECT r.*, u.name as user_name
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.booking_id = $1 AND r.user_id = $2`,
      [bookingId, req.user.id]
    );

    if (result.rows.length === 0) {
      res.status(200).json({
        status: 'success',
        data: null,
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};



