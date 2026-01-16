import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      errors: errors.array()
    });
  }
  next();
};

export const validateUser = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),

  validateRequest
];

export const validateProfile = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  
  body('phoneNo')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Phone number is required'),
  
  body('dob')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  
  body('preAddress')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Present address is required'),
  
  body('perAddress')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Permanent address is required'),
  
  body('postalCode')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Postal code is required'),
  
  body('country')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Country is required'),

  validateRequest
];

export const validateAppointment = [
  body('attorneyId')
    .notEmpty()
    .withMessage('Attorney ID is required'),
  
  body('select_date')
    .notEmpty(),
    // .withMessage('Date is required'),  
  body('slot_time')
    .notEmpty()
    .withMessage('Time slot is required'),
    // .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    // .withMessage('Invalid time format (HH:mm)'),
  
  body('case_type')
    .notEmpty()
    .withMessage('Case type is required'),
  
  body('short_description')
    .notEmpty()
    .withMessage('Short description is required')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Short description must be between 10 and 500 characters'),
  
  // body('payment_method')
  //   .notEmpty()
  //   .withMessage('Payment method is required')
  //   .isIn(['card', 'paypal'])
  //   .withMessage('Invalid payment method'),
  
  // Conditional validation for card payment

  validateRequest
];

export const validateMessage = [
  body('receiver')
    .notEmpty()
    .withMessage('Receiver ID is required'),
  
  body('receiverModel')
    .notEmpty()
    .withMessage('Receiver model is required')
    .isIn(['User', 'Attorney', 'Admin'])
    .withMessage('Invalid receiver model'),
  
  body('content')
    .notEmpty()
    .withMessage('Message content is required')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),

  validateRequest
];
