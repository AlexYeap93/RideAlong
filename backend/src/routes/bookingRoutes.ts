import express from 'express';
import {
  getBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
  getBookingsByUser,
  getBookingsByRide,
  cancelBooking,
  getBookedSeats,
  updatePickupTimes,
  requestAdditionalAmount,
  respondToAdditionalAmount,
} from '../controllers/bookingController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/bookings - Get all bookings
router.get('/', getBookings);

// GET /api/bookings/user/:userId - Get bookings by user
router.get('/user/:userId', getBookingsByUser);

// GET /api/bookings/ride/:rideId - Get bookings by ride
router.get('/ride/:rideId', getBookingsByRide);

// GET /api/bookings/ride/:rideId/seats - Get booked seats for a ride
router.get('/ride/:rideId/seats', getBookedSeats);

// GET /api/bookings/:id - Get booking by ID
router.get('/:id', getBookingById);

// POST /api/bookings - Create a new booking
router.post('/', createBooking);

// PUT /api/bookings/pickup-times - Update pickup times for multiple bookings (must be before /:id)
router.put('/pickup-times', updatePickupTimes);

// POST /api/bookings/:bookingId/request-additional-amount - Driver requests additional amount
router.post('/:bookingId/request-additional-amount', requestAdditionalAmount);

// POST /api/bookings/:bookingId/respond-additional-amount - User accepts/declines additional amount request
router.post('/:bookingId/respond-additional-amount', respondToAdditionalAmount);

// PUT /api/bookings/:id - Update booking
router.put('/:id', updateBooking);

// DELETE /api/bookings/:id - Delete booking
router.delete('/:id', deleteBooking);

// POST /api/bookings/:id/cancel - Cancel booking
router.post('/:id/cancel', cancelBooking);

export default router;









