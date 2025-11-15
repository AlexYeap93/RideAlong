import express from 'express';
import {
  createIssue,
  getIssues,
  getIssueById,
  updateIssue,
} from '../controllers/issueController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();

// POST /api/issues - Create a new issue (authenticated users)
router.post('/', authenticate, createIssue);

// GET /api/issues - Get all issues (admin only)
router.get('/', authenticate, requireAdmin, getIssues);

// GET /api/issues/:id - Get issue by ID
router.get('/:id', authenticate, getIssueById);

// PUT /api/issues/:id - Update issue (admin only)
router.put('/:id', authenticate, requireAdmin, updateIssue);

export default router;




