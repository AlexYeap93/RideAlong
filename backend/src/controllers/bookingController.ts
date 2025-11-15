import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { CustomError } from '../middleware/errorHandler';

// Get all bookings
export const getBookings = async (req: Request,res: Response,next: NextFunction) => {
  try {
    const result = await query(
      `SELECT b.*, 
              r.destination, r.ride_date, r.ride_time, r.price,
              u.name as user_name, u.email as user_email,
              d.available_seats
       FROM bookings b
       JOIN rides r ON b.ride_id = r.id
       JOIN users u ON b.user_id = u.id
       JOIN drivers dr ON r.driver_id = dr.id
       LEFT JOIN drivers d ON r.driver_id = d.id
       ORDER BY b.created_at DESC`
    );
    res.status(200).json({
      status: 'success',
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

// Get a booking by id
export const getBookingById = async (req: Request,res: Response,next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT b.*, 
              r.destination, r.ride_date, r.ride_time, r.price,
              u.name as user_name, u.email as user_email,
              d.available_seats, d.car_photo
       FROM bookings b
       JOIN rides r ON b.ride_id = r.id
       JOIN users u ON b.user_id = u.id
       JOIN drivers dr ON r.driver_id = dr.id
       LEFT JOIN drivers d ON r.driver_id = d.id
       WHERE b.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      const error: CustomError = new Error('Booking not found');
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

// create a booking
export const createBooking = async (req: Request,res: Response,next: NextFunction) => {
  try {
    if (!req.user) {
      const error: CustomError = new Error('Authentication required');
      error.statusCode = 401;
      throw error;
    }

    // Check if user is suspended
    const userCheck = await query('SELECT is_suspended FROM users WHERE id = $1', [req.user.id]);
    if (userCheck.rows.length > 0 && userCheck.rows[0].is_suspended === true) {
      const error: CustomError = new Error('Your account has been suspended. You cannot book rides.');
      error.statusCode = 403;
      throw error;
    }

    // Check if driver is suspended
    const rideCheck = await query(
      `SELECT r.id, d.user_id as driver_user_id
       FROM rides r
       JOIN drivers d ON r.driver_id = d.id
       WHERE r.id = $1`,
      [req.body.rideId]
    );
    // Check if driver is suspended if not throw error
    if (rideCheck.rows.length > 0) {
      const driverUserId = rideCheck.rows[0].driver_user_id;
      const driverCheck = await query('SELECT is_suspended FROM users WHERE id = $1', [driverUserId]);
      if (driverCheck.rows.length > 0 && driverCheck.rows[0].is_suspended === true) {
        const error: CustomError = new Error('This driver has been suspended. You cannot book this ride.');
        error.statusCode = 403;
        throw error;
      }
    }

    const { rideId, numberOfSeats } = req.body;

    if (!rideId || !numberOfSeats) {
      const error: CustomError = new Error('Ride ID and number of seats are required');
      error.statusCode = 400;
      throw error;
    }

    // Check if ride exists and is active
    const rideResult = await query(
      `SELECT r.*, d.available_seats, COUNT(b.id) as booked_seats
       FROM rides r
       JOIN drivers d ON r.driver_id = d.id
       LEFT JOIN bookings b ON r.id = b.ride_id AND b.status != 'cancelled'
       WHERE r.id = $1 AND r.status = 'active'
       GROUP BY r.id, d.available_seats`,
      [rideId]
    );

    if (rideResult.rows.length === 0) {
      const error: CustomError = new Error('Ride not found or not active');
      error.statusCode = 404;
      throw error;
    }

    const ride = rideResult.rows[0];
    const availableSeats = ride.available_seats - parseInt(ride.booked_seats);

    if (numberOfSeats > availableSeats) {
      const error: CustomError = new Error('Not enough available seats');
      error.statusCode = 400;
      throw error;
    }

    // Check if user already has a booking for this specific ride
    const existingBooking = await query(
      'SELECT id, status FROM bookings WHERE user_id = $1 AND ride_id = $2 AND status != $3',
      [req.user.id, rideId, 'cancelled']
    );

    if (existingBooking.rows.length > 0) {
      const bookingStatus = existingBooking.rows[0].status;
      const error: CustomError = new Error(
        `You already have a ${bookingStatus} booking for this ride. You can book different rides, but cannot book the same ride twice.`
      );
      error.statusCode = 409;
      throw error;
    }

    const { seatNumber, pickupLocation, pickupLatitude, pickupLongitude } = req.body;
    
    const result = await query(
      `INSERT INTO bookings (user_id, ride_id, number_of_seats, seat_number, pickup_location, pickup_latitude, pickup_longitude, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [
        req.user.id, 
        rideId, 
        numberOfSeats, 
        seatNumber || null, 
        pickupLocation || null,
        pickupLatitude || null,
        pickupLongitude || null,
        'confirmed'
      ]
    );

    res.status(201).json({
      status: 'success',
      message: 'Booking created successfully',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};
// update a booking
export const updateBooking = async (req: Request,res: Response,next: NextFunction) => {
  try {
    const { id } = req.params;
    const { numberOfSeats, status, pickupTime, pickupLocation } = req.body;

    // Verify user owns this booking or is admin
    if (req.user) {
      const bookingCheck = await query(
        'SELECT user_id FROM bookings WHERE id = $1',
        [id]
      );

      if (bookingCheck.rows.length === 0) {
        const error: CustomError = new Error('Booking not found');
        error.statusCode = 404;
        throw error;
      }

      if (bookingCheck.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
        const error: CustomError = new Error('Unauthorized to update this booking');
        error.statusCode = 403;
        throw error;
      }
    }

    const result = await query(
      `UPDATE bookings 
       SET number_of_seats = COALESCE($1, number_of_seats),
           status = COALESCE($2, status),
           pickup_time = COALESCE($3, pickup_time),
           pickup_location = COALESCE($4, pickup_location),
           updated_at = NOW()
       WHERE id = $5 
       RETURNING *`,
      [numberOfSeats, status, pickupTime, pickupLocation, id]
    );

    res.status(200).json({
      status: 'success',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};
// update pickup times
export const updatePickupTimes = async (req: Request,res: Response,next: NextFunction) => {
  try {
    if (!req.user) {
      const error: CustomError = new Error('Authentication required');
      error.statusCode = 401;
      throw error;
    }

    const { rideId, pickupTimes } = req.body; // pickupTimes is array of { bookingId, pickupTime, pickupLocation }

    if (!rideId || !pickupTimes || !Array.isArray(pickupTimes)) {
      const error: CustomError = new Error('Ride ID and pickup times array are required');
      error.statusCode = 400;
      throw error;
    }

    // Verify user is the driver of this ride
    const rideCheck = await query(
      `SELECT r.driver_id, d.user_id 
       FROM rides r
       JOIN drivers d ON r.driver_id = d.id
       WHERE r.id = $1`,
      [rideId]
    );

    if (rideCheck.rows.length === 0) {
      const error: CustomError = new Error('Ride not found');
      error.statusCode = 404;
      throw error;
    }

    if (rideCheck.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
      const error: CustomError = new Error('Unauthorized to update pickup times for this ride');
      error.statusCode = 403;
      throw error;
    }

    // Helper function to convert 12-hour to 24-hour format
    const convertTo24Hour = (time12h: string): string => {
      const [time, modifier] = time12h.split(' ');
      let [hours, minutes] = time.split(':');
      if (hours === '12') hours = '00';
      if (modifier === 'PM') hours = String(parseInt(hours) + 12);
      return `${hours.padStart(2, '0')}:${(minutes || '00').padStart(2, '0')}:00`;
    };

    // Update each booking's pickup time
    const updatedBookings = [];
    for (const pickupTimeData of pickupTimes) {
      const { bookingId, pickupTime, pickupLocation } = pickupTimeData;
      
      if (!bookingId || !pickupTime) {
        continue; // Skip invalid entries
      }

      const time24 = convertTo24Hour(pickupTime);
      
      const result = await query(
        `UPDATE bookings 
         SET pickup_time = $1,
             pickup_location = COALESCE($2, pickup_location),
             updated_at = NOW()
         WHERE id = $3 AND ride_id = $4
         RETURNING *`,
        [time24, pickupLocation || null, bookingId, rideId]
      );

      if (result.rows.length > 0) {
        updatedBookings.push(result.rows[0]);
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Pickup times updated successfully',
      data: updatedBookings,
    });
  } catch (error) {
    next(error);
  }
};

// delete a booking
export const deleteBooking = async (req: Request,res: Response,next: NextFunction) => {
  try {
    const { id } = req.params;

    // Verify user owns this booking or is admin
    if (req.user) {
      const bookingCheck = await query(
        'SELECT user_id FROM bookings WHERE id = $1',
        [id]
      );

      if (bookingCheck.rows.length === 0) {
        const error: CustomError = new Error('Booking not found');
        error.statusCode = 404;
        throw error;
      }

      if (bookingCheck.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
        const error: CustomError = new Error('Unauthorized to delete this booking');
        error.statusCode = 403;
        throw error;
      }
    }

    const result = await query('DELETE FROM bookings WHERE id = $1 RETURNING id', [id]);

    res.status(200).json({
      status: 'success',
      message: 'Booking deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
// get bookings by user
export const getBookingsByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const result = await query(
      `SELECT b.*, 
              r.destination, r.ride_date, r.ride_time, r.price,
              d.available_seats, d.car_photo,
              u.name as driver_name,
              u.phone as driver_phone,
              COALESCE(AVG(rat.rating), 0) as average_rating
       FROM bookings b
       JOIN rides r ON b.ride_id = r.id
       JOIN drivers dr ON r.driver_id = dr.id
       JOIN users u ON dr.user_id = u.id
       LEFT JOIN drivers d ON r.driver_id = d.id
       LEFT JOIN ratings rat ON rat.driver_id = dr.id
       WHERE b.user_id = $1
       GROUP BY b.id, r.id, d.id, u.id, dr.id
       ORDER BY r.ride_date DESC, r.ride_time DESC`,
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
// request additional amount handling
export const requestAdditionalAmount = async (req: Request,res: Response,next: NextFunction) => {
  try {
    if (!req.user) {
      const error: CustomError = new Error('Authentication required');
      error.statusCode = 401;
      throw error;
    }

    const { bookingId } = req.params;
    const { additionalAmount } = req.body;

    if (!additionalAmount || additionalAmount <= 0) {
      const error: CustomError = new Error('Additional amount must be greater than 0');
      error.statusCode = 400;
      throw error;
    }

    // Verify the booking exists and belongs to a ride owned by the driver
    const bookingCheck = await query(
      `SELECT b.id, b.user_id, b.ride_id, r.driver_id, d.user_id as driver_user_id
       FROM bookings b
       JOIN rides r ON b.ride_id = r.id
       JOIN drivers d ON r.driver_id = d.id
       WHERE b.id = $1 AND b.status = 'confirmed'`,
      [bookingId]
    );

    if (bookingCheck.rows.length === 0) {
      const error: CustomError = new Error('Booking not found or not confirmed');
      error.statusCode = 404;
      throw error;
    }

    const booking = bookingCheck.rows[0];

    // Verify the user is the driver
    if (booking.driver_user_id !== req.user.id && req.user.role !== 'admin') {
      const error: CustomError = new Error('Unauthorized: Only the driver can request additional amount');
      error.statusCode = 403;
      throw error;
    }

    // Check if there's already a pending request
    const existingRequest = await query(
      'SELECT additional_amount_status FROM bookings WHERE id = $1',
      [bookingId]
    );

    if (existingRequest.rows[0].additional_amount_status === 'pending') {
      const error: CustomError = new Error('There is already a pending additional amount request for this booking');
      error.statusCode = 409;
      throw error;
    }

    // Update booking with additional amount request
    const result = await query(
      `UPDATE bookings 
       SET additional_amount_requested = $1,
           additional_amount_status = 'pending',
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [additionalAmount, bookingId]
    );

    res.status(200).json({
      status: 'success',
      message: 'Additional amount request sent successfully',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// respond to additional amount request from user to driver
export const respondToAdditionalAmount = async (req: Request,res: Response,next: NextFunction) => {
  try {
    if (!req.user) {
      const error: CustomError = new Error('Authentication required');
      error.statusCode = 401;
      throw error;
    }

    const { bookingId } = req.params;
    const { response } = req.body; // 'accepted' or 'declined'

    if (!response || !['accepted', 'declined'].includes(response)) {
      const error: CustomError = new Error('Response must be either "accepted" or "declined"');
      error.statusCode = 400;
      throw error;
    }

    // Verify the booking exists and belongs to the user
    const bookingCheck = await query(
      `SELECT b.id, b.user_id, b.additional_amount_status, b.additional_amount_requested
       FROM bookings b
       WHERE b.id = $1 AND b.status = 'confirmed'`,
      [bookingId]
    );

    if (bookingCheck.rows.length === 0) {
      const error: CustomError = new Error('Booking not found or not confirmed');
      error.statusCode = 404;
      throw error;
    }

    const booking = bookingCheck.rows[0];

    // Verify the user owns this booking
    if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
      const error: CustomError = new Error('Unauthorized: Only the booking owner can respond');
      error.statusCode = 403;
      throw error;
    }

    // Check if there's a pending request
    if (booking.additional_amount_status !== 'pending') {
      const error: CustomError = new Error('No pending additional amount request for this booking');
      error.statusCode = 400;
      throw error;
    }

    if (response === 'accepted') {
      // Update booking status to accepted
      const result = await query(
        `UPDATE bookings 
         SET additional_amount_status = 'accepted',
             updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [bookingId]
      );

      // Update payment amount to include additional amount
      const additionalAmount = parseFloat(booking.additional_amount_requested) || 0;
      await query(
        `UPDATE payments 
         SET amount = amount + $1,
             updated_at = NOW()
         WHERE booking_id = $2`,
        [additionalAmount, bookingId]
      );

      res.status(200).json({
        status: 'success',
        message: 'Additional amount request accepted',
        data: result.rows[0],
      });
    } else {
      // Decline: Cancel the booking
      const result = await query(
        `UPDATE bookings 
         SET additional_amount_status = 'declined',
             status = 'cancelled',
             updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [bookingId]
      );

      // Refund payment if exists
      await query(
        `UPDATE payments 
         SET payment_status = 'refunded',
             updated_at = NOW()
         WHERE booking_id = $1 AND payment_status = 'completed'`,
        [bookingId]
      );

      res.status(200).json({
        status: 'success',
        message: 'Additional amount request declined. Booking has been cancelled.',
        data: result.rows[0],
      });
    }
  } catch (error) {
    next(error);
  }
};

// get bookings by ride
export const getBookingsByRide = async (req: Request,res: Response,next: NextFunction) => {
  try {
    const { rideId } = req.params;
    const result = await query(
      `SELECT b.*, 
              u.name as user_name, u.email as user_email, u.phone as user_phone
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       WHERE b.ride_id = $1 AND b.status != 'cancelled'
       ORDER BY b.created_at ASC`,
      [rideId]
    );

    res.status(200).json({
      status: 'success',
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};
// get booked seats by ride
export const getBookedSeats = async (req: Request,res: Response,next: NextFunction) => {
  try {
    const { rideId } = req.params;
    const result = await query(
      `SELECT seat_number 
       FROM bookings 
       WHERE ride_id = $1 AND status != 'cancelled' AND seat_number IS NOT NULL`,
      [rideId]
    );

    const bookedSeats = result.rows.map((row: any) => row.seat_number);
    res.status(200).json({
      status: 'success',
      data: bookedSeats,
    });
  } catch (error) {
    next(error);
  }
};

// cancel a booking
export const cancelBooking = async (req: Request,res: Response,next: NextFunction) => {
  try {
    const { id } = req.params;
    // Verify user owns this booking or is admin
    if (req.user) {
      const bookingCheck = await query(
        'SELECT user_id FROM bookings WHERE id = $1',
        [id]
      );

      if (bookingCheck.rows.length === 0) {
        const error: CustomError = new Error('Booking not found');
        error.statusCode = 404;
        throw error;
      }

      if (bookingCheck.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
        const error: CustomError = new Error('Unauthorized to cancel this booking');
        error.statusCode = 403;
        throw error;
      }
    }

    const result = await query(
      `UPDATE bookings 
       SET status = 'cancelled', updated_at = NOW() 
       WHERE id = $1 
       RETURNING *`,
      [id]
    );

    res.status(200).json({
      status: 'success',
      message: 'Booking cancelled successfully',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};









