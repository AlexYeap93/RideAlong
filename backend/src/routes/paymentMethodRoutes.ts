import express from 'express';
import {
  getPaymentMethods,
  getPaymentMethodById,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
} from '../controllers/paymentMethodController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/payment-methods - Get all payment methods for current user
router.get('/', getPaymentMethods);

// GET /api/payment-methods/:id - Get payment method by ID
router.get('/:id', getPaymentMethodById);

// POST /api/payment-methods - Create a new payment method
router.post('/', createPaymentMethod);

// PUT /api/payment-methods/:id - Update payment method
router.put('/:id', updatePaymentMethod);

// DELETE /api/payment-methods/:id - Delete payment method
router.delete('/:id', deletePaymentMethod);

export default router;



