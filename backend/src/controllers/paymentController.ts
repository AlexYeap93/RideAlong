import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { CustomError } from '../middleware/errorHandler';

// get all payments
export const getPayments = async (req: Request,res: Response,next: NextFunction) => {
  try {
    const result = await query(
      `SELECT p.*, 
              b.id as booking_id,
              u.name as user_name,
              r.destination, r.ride_date
       FROM payments p
       JOIN bookings b ON p.booking_id = b.id
       JOIN users u ON b.user_id = u.id
       JOIN rides r ON b.ride_id = r.id
       ORDER BY p.created_at DESC`
    );
    res.status(200).json({
      status: 'success',
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

// get a payment by id
export const getPaymentById = async (req: Request,res: Response,next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT p.*, 
              b.id as booking_id,
              u.name as user_name, u.email as user_email,
              r.destination, r.ride_date, r.ride_time
       FROM payments p
       JOIN bookings b ON p.booking_id = b.id
       JOIN users u ON b.user_id = u.id
       JOIN rides r ON b.ride_id = r.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      const error: CustomError = new Error('Payment not found');
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

// create a payment
export const createPayment = async (req: Request,res: Response,next: NextFunction) => {
  try {
    if (!req.user) {
      const error: CustomError = new Error('Authentication required');
      error.statusCode = 401;
      throw error;
    }

    // Check if user is suspended
    const userCheck = await query('SELECT is_suspended FROM users WHERE id = $1', [req.user.id]);
    if (userCheck.rows.length > 0 && userCheck.rows[0].is_suspended === true) {
      const error: CustomError = new Error('Your account has been suspended. You cannot make payments.');
      error.statusCode = 403;
      throw error;
    }

    const { bookingId, amount, paymentMethod, paymentStatus } = req.body;

    if (!bookingId || !amount || !paymentMethod) {
      const error: CustomError = new Error('Booking ID, amount, and payment method are required');
      error.statusCode = 400;
      throw error;
    }

    // Verify booking exists and belongs to user
    const bookingResult = await query(
      'SELECT user_id FROM bookings WHERE id = $1',
      [bookingId]
    );

    if (bookingResult.rows.length === 0) {
      const error: CustomError = new Error('Booking not found');
      error.statusCode = 404;
      throw error;
    }

    if (bookingResult.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
      const error: CustomError = new Error('Unauthorized to create payment for this booking');
      error.statusCode = 403;
      throw error;
    }

    // Check if payment already exists
    const existingPayment = await query(
      'SELECT id FROM payments WHERE booking_id = $1',
      [bookingId]
    );

    if (existingPayment.rows.length > 0) {
      const error: CustomError = new Error('Payment already exists for this booking');
      error.statusCode = 409;
      throw error;
    }

    const result = await query(
      `INSERT INTO payments (booking_id, amount, payment_method, payment_status) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [bookingId, amount, paymentMethod, paymentStatus || 'pending']
    );

    res.status(201).json({
      status: 'success',
      message: 'Payment created successfully',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// update a payment
export const updatePayment = async (req: Request,res: Response,next: NextFunction) => {
  try {
    const { id } = req.params;
    const { amount, paymentMethod, paymentStatus } = req.body;

    // Only admin can update payments
    if (req.user && req.user.role !== 'admin') {
      const error: CustomError = new Error('Admin access required');
      error.statusCode = 403;
      throw error;
    }

    const result = await query(
      `UPDATE payments 
       SET amount = COALESCE($1, amount),
           payment_method = COALESCE($2, payment_method),
           payment_status = COALESCE($3, payment_status),
           updated_at = NOW()
       WHERE id = $4 
       RETURNING *`,
      [amount, paymentMethod, paymentStatus, id]
    );

    if (result.rows.length === 0) {
      const error: CustomError = new Error('Payment not found');
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

// get payments by user
export const getPaymentsByUser = async (req: Request,res: Response,next: NextFunction) => {
  try {
    const { userId } = req.params;
    const result = await query(
      `SELECT p.*, 
              b.id as booking_id,
              r.destination, r.ride_date, r.ride_time
       FROM payments p
       JOIN bookings b ON p.booking_id = b.id
       JOIN rides r ON b.ride_id = r.id
       WHERE b.user_id = $1
       ORDER BY p.created_at DESC`,
      [userId]
    );

    res.status(200).json({
      status: 'success',
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

// get payments by booking
export const getPaymentsByBooking = async (req: Request,res: Response,next: NextFunction) => {
  try {
    const { bookingId } = req.params;
    const result = await query(
      `SELECT p.*
       FROM payments p
       WHERE p.booking_id = $1
       ORDER BY p.created_at DESC`,
      [bookingId]
    );

    res.status(200).json({
      status: 'success',
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};









