import express from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  updatePassword,
  deleteUser,
  getUserRides,
  suspendUser,
  unsuspendUser,
} from '../controllers/userController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/users - Get all users (admin only)
router.get('/', requireAdmin, getUsers);

// GET /api/users/:id - Get user by ID
router.get('/:id', getUserById);

// PUT /api/users/:id - Update user
router.put('/:id', updateUser);

// PUT /api/users/:id/password - Update user password
router.put('/:id/password', updatePassword);

// DELETE /api/users/:id - Delete user
router.delete('/:id', deleteUser);

// GET /api/users/:id/rides - Get user's rides
router.get('/:id/rides', getUserRides);

// POST /api/users/:id/suspend - Suspend user (admin only)
router.post('/:id/suspend', requireAdmin, suspendUser);

// POST /api/users/:id/unsuspend - Unsuspend user (admin only)
router.post('/:id/unsuspend', requireAdmin, unsuspendUser);

export default router;









