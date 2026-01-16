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

export const validateAvailability = [
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  
  body('timeSlots')
    .isArray()
    .withMessage('timeSlots must be an array'),
  
  body('timeSlots.*.time')
    .notEmpty()
    .withMessage('Time slot is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid time format (HH:mm)'),
  
  body('timeSlots.*.isAvailable')
    .isBoolean()
    .withMessage('Availability must be a boolean'),

  validateRequest
];

export const validateMessage = [
  body('receiver')
    .notEmpty()
    .withMessage('Receiver ID is required'),
  
  body('receiverModel')
    .notEmpty()
    .withMessage('Receiver model is required')
    .equals('User')
    .withMessage('Invalid receiver model'),
  
  body('content')
    .notEmpty()
    .withMessage('Message content is required')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),

  validateRequest
];
