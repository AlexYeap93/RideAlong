import express from 'express';
import {
  getRides,
  getRideById,
  createRide,
  updateRide,
  deleteRide,
  getRidesByDriver,
  getRidesByDestination,
  getAvailableRides,
} from '../controllers/rideController';
import { authenticate, requireDriver } from '../middleware/auth';

const router = express.Router();

// GET /api/rides - Get all rides (public, but can filter)
router.get('/', getRides);

// GET /api/rides/available - Get available rides
router.get('/available', getAvailableRides);

// GET /api/rides/destination/:destination - Get rides by destination
router.get('/destination/:destination', getRidesByDestination);

// GET /api/rides/driver/:driverId - Get rides by driver
router.get('/driver/:driverId', getRidesByDriver);

// GET /api/rides/:id - Get ride by ID
router.get('/:id', getRideById);

// All routes below require authentication
router.use(authenticate);

// POST /api/rides - Create a new ride (driver only)
router.post('/', requireDriver, createRide);

// PUT /api/rides/:id - Update ride (driver only)
router.put('/:id', requireDriver, updateRide);

// DELETE /api/rides/:id - Delete ride (driver only)
router.delete('/:id', requireDriver, deleteRide);

export default router;









