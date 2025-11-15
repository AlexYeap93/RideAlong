import express from 'express';
import {
  getDrivers,
  getDriverById,
  getMyDriverProfile,
  createDriver,
  updateDriver,
  deleteDriver,
  getDriverRides,
  approveDriver,
} from '../controllers/driverController';
import { authenticate, requireAdmin, requireDriver } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/drivers - Get all drivers
router.get('/', getDrivers);

// GET /api/drivers/me - Get current user's driver profile (must come before /:id)
router.get('/me', getMyDriverProfile);

// POST /api/drivers - Create a new driver profile
router.post('/', createDriver);

// GET /api/drivers/:id - Get driver by ID
router.get('/:id', getDriverById);

// PUT /api/drivers/:id - Update driver
router.put('/:id', requireDriver, updateDriver);

// DELETE /api/drivers/:id - Delete driver
router.delete('/:id', requireAdmin, deleteDriver);

// GET /api/drivers/:id/rides - Get driver's rides
router.get('/:id/rides', getDriverRides);

// POST /api/drivers/:id/approve - Approve driver (admin only)
router.post('/:id/approve', requireAdmin, approveDriver);

export default router;







