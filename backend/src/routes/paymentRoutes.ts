import express from 'express';
import {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  getPaymentsByUser,
  getPaymentsByBooking,
} from '../controllers/paymentController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/payments - Get all payments
router.get('/', getPayments);

// GET /api/payments/user/:userId - Get payments by user
router.get('/user/:userId', getPaymentsByUser);

// GET /api/payments/booking/:bookingId - Get payments by booking
router.get('/booking/:bookingId', getPaymentsByBooking);

// GET /api/payments/:id - Get payment by ID
router.get('/:id', getPaymentById);

// POST /api/payments - Create a new payment
router.post('/', createPayment);

// PUT /api/payments/:id - Update payment
router.put('/:id', updatePayment);

export default router;









