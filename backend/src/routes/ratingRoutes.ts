import express from 'express';
import {
  createRating,
  getDriverRatings,
  getRatingByBooking,
} from '../controllers/ratingController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// POST /api/ratings - Create a rating
router.post('/', createRating);

// GET /api/ratings/driver/:driverId - Get ratings for a driver
router.get('/driver/:driverId', getDriverRatings);

// GET /api/ratings/booking/:bookingId - Get rating for a specific booking
router.get('/booking/:bookingId', getRatingByBooking);

export default router;



