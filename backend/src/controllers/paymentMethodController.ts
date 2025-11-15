import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { CustomError } from '../middleware/errorHandler';

// get all payment methods
export const getPaymentMethods = async (req: Request,res: Response, next: NextFunction) => {
  
  try {
    if (!req.user) {
      const error: CustomError = new Error('Authentication required');
      error.statusCode = 401;
      throw error;
    }

    const result = await query(
      `SELECT * FROM payment_methods 
       WHERE user_id = $1 
       ORDER BY is_default DESC, created_at DESC`,
      [req.user.id]
    );

    res.status(200).json({
      status: 'success',
      data: result.rows,
    });
  } 
  catch (error) {
    next(error);
  }
};

// get a payment method by id
export const getPaymentMethodById = async (req: Request, res: Response,next: NextFunction) => {
  
  try {
    if (!req.user) {
      const error: CustomError = new Error('Authentication required');
      error.statusCode = 401;
      throw error;
    }

    const { id } = req.params;
    const result = await query(
      'SELECT * FROM payment_methods WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      const error: CustomError = new Error('Payment method not found');
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

// create a payment method
export const createPaymentMethod = async (req: Request, res: Response, next: NextFunction) => {
  
  try {
    if (!req.user) {
      const error: CustomError = new Error('Authentication required');
      error.statusCode = 401;
      throw error;
    }

    const { type, brand, last4, expiryMonth, expiryYear, cardholderName, isDefault } = req.body;

    if (!type || !last4) {
      const error: CustomError = new Error('Type and last4 are required');
      error.statusCode = 400;
      throw error;
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await query(
        'UPDATE payment_methods SET is_default = FALSE WHERE user_id = $1',
        [req.user.id]
      );
    }

    const result = await query(
      `INSERT INTO payment_methods (user_id, type, brand, last4, expiry_month, expiry_year, cardholder_name, is_default) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [req.user.id, type, brand || null, last4, expiryMonth || null, expiryYear || null, cardholderName || null, isDefault || false]
    );

    res.status(201).json({
      status: 'success',
      message: 'Payment method added successfully',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// update a payment method
export const updatePaymentMethod = async (req: Request,res: Response,next: NextFunction) => {
  
  try {
    if (!req.user) {
      const error: CustomError = new Error('Authentication required');
      error.statusCode = 401;
      throw error;
    }

    const { id } = req.params;
    const { isDefault } = req.body;

    // Verify ownership
    const checkResult = await query(
      'SELECT user_id FROM payment_methods WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      const error: CustomError = new Error('Payment method not found');
      error.statusCode = 404;
      throw error;
    }

    if (checkResult.rows[0].user_id !== req.user.id) {
      const error: CustomError = new Error('Unauthorized to update this payment method');
      error.statusCode = 403;
      throw error;
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await query(
        'UPDATE payment_methods SET is_default = FALSE WHERE user_id = $1 AND id != $2',
        [req.user.id, id]
      );
    }

    const result = await query(
      `UPDATE payment_methods 
       SET is_default = COALESCE($1, is_default),
           updated_at = NOW()
       WHERE id = $2 
       RETURNING *`,
      [isDefault, id]
    );

    res.status(200).json({
      status: 'success',
      message: 'Payment method updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};
// delete a payment method
export const deletePaymentMethod = async (req: Request,res: Response,next: NextFunction) => {
  try {
    if (!req.user) {
      const error: CustomError = new Error('Authentication required');
      error.statusCode = 401;
      throw error;
    }

    const { id } = req.params;

    // Verify ownership
    const checkResult = await query(
      'SELECT user_id FROM payment_methods WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      const error: CustomError = new Error('Payment method not found');
      error.statusCode = 404;
      throw error;
    }

    if (checkResult.rows[0].user_id !== req.user.id) {
      const error: CustomError = new Error('Unauthorized to delete this payment method');
      error.statusCode = 403;
      throw error;
    }

    await query('DELETE FROM payment_methods WHERE id = $1', [id]);

    res.status(200).json({
      status: 'success',
      message: 'Payment method deleted successfully',
    });
  } catch (error) {
    next(error); // passes the error to the error handler.ts
  }
};



