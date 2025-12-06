import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { CustomError } from '../middleware/errorHandler';

//classify priority based on issue type
const getPriorityFromIssueType = (issueType: string): string => {
  const priorityMap: { [key: string]: string } = {
    'safety': 'critical',
    'driver-noshow': 'high',
    'driver-late': 'high',
    'route': 'medium',
    'payment': 'medium',
    'other': 'low'
  };
  
  return priorityMap[issueType?.toLowerCase()] || 'medium';
};

//submit a issue ticket
export const createIssue = async (req: Request,res: Response,next: NextFunction) => {
  try {
    if (!req.user) {
      const error: CustomError = new Error('Authentication required');
      error.statusCode = 401;
      throw error;
    }

    // Check if user is suspended
    const userCheck = await query('SELECT is_suspended FROM users WHERE id = $1', [req.user.id]);
    if (userCheck.rows.length > 0 && userCheck.rows[0].is_suspended === true) {
      const error: CustomError = new Error('Your account has been suspended. You cannot report issues.');
      error.statusCode = 403;
      throw error;
    }

    const { bookingId, issueType, subject, description, reportedUserId } = req.body;

    if (!issueType || !subject || !description) {
      const error: CustomError = new Error('Issue type, subject, and description are required');
      error.statusCode = 400;
      throw error;
    }

    // The reporter is always the authenticated user (the one reporting the issue)
    const reporterUserId = req.user.id;
    
    // If bookingId is provided, get the driver's user_id from the booking
    let driverUserId = reportedUserId || null;
    
    if (bookingId && !driverUserId) {
      // Fetch the driver's user_id from the booking
      const bookingResult = await query(
        `SELECT d.user_id as driver_user_id
         FROM bookings b
         JOIN rides r ON b.ride_id = r.id
         JOIN drivers d ON r.driver_id = d.id
         WHERE b.id = $1`,
        [bookingId]
      );

      if (bookingResult.rows.length > 0) {
        driverUserId = bookingResult.rows[0].driver_user_id;
      }
    }

    // Automatically assign priority based on issue type
    const priority = getPriorityFromIssueType(issueType);

    const result = await query(
      `INSERT INTO issues (user_id, booking_id, issue_type, subject, description, reported_user_id, status, priority) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [
        reporterUserId, // user_id = the reporter (the user reporting the issue)
        bookingId || null,
        issueType,
        subject,
        description,
        driverUserId, // reported_user_id = the driver (the one being reported)
        'open',
        priority
      ]
    );

    res.status(201).json({
      status: 'success',
      message: 'Issue reported successfully',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};
// get all issues
export const getIssues = async (req: Request,res: Response,next: NextFunction) => {
  try {
    // Only admins can see all issues
    if (!req.user || req.user.role !== 'admin') {
      const error: CustomError = new Error('Admin access required');
      error.statusCode = 403;
      throw error;
    }

    const { status, priority } = req.query;
    let sql = `
      SELECT i.*, 
             u.name as reporter_name, 
             u.email as reporter_email,
             ru.name as reported_user_name,
             ru.email as reported_user_email,
             b.id as booking_id
      FROM issues i
      JOIN users u ON i.user_id = u.id
      LEFT JOIN users ru ON i.reported_user_id = ru.id
      LEFT JOIN bookings b ON i.booking_id = b.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (status) {
      sql += ` AND i.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (priority) {
      sql += ` AND i.priority = $${paramCount}`;
      params.push(priority);
      paramCount++;
    }

    sql += ` ORDER BY i.created_at DESC`;

    const result = await query(sql, params);

    res.status(200).json({
      status: 'success',
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

// get a issue by id
export const getIssueById = async (req: Request,res: Response,next: NextFunction) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT i.*, 
              u.name as reporter_name, 
              u.email as reporter_email,
              ru.name as reported_user_name,
              ru.email as reported_user_email
       FROM issues i
       JOIN users u ON i.user_id = u.id
       LEFT JOIN users ru ON i.reported_user_id = ru.id
       WHERE i.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      const error: CustomError = new Error('Issue not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if user can access this issue (admin or issue owner)
    if (req.user && (req.user.role === 'admin' || req.user.id === result.rows[0].user_id)) {
      res.status(200).json({
        status: 'success',
        data: result.rows[0],
      });
    } else {
      const error: CustomError = new Error('Unauthorized to view this issue');
      error.statusCode = 403;
      throw error;
    }
  } 
  catch (error) {
    next(error);
  }
};

export const updateIssue = async (req: Request,res: Response,next: NextFunction) => {
  try {
    // Only admins can update issues
    if (!req.user || req.user.role !== 'admin') {
      const error: CustomError = new Error('Admin access required');
      error.statusCode = 403;
      throw error;
    }

    const { id } = req.params;
    const { status, priority, adminNotes } = req.body;

    const updates: string[] = [];
    const params: any[] = [];
    let paramCount = 1;

    // Update status if provided
    if (status) {
      updates.push(`status = $${paramCount}`);
      params.push(status);
      paramCount++;
    }

    updates.push(`updated_at = NOW()`);
    params.push(id);

    const result = await query(
      `UPDATE issues 
       SET ${updates.join(', ')} 
       WHERE id = $${paramCount} 
       RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      const error: CustomError = new Error('Issue not found');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      status: 'success',
      message: 'Issue updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

