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

export const validateAttorney = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone_number').trim().notEmpty().withMessage('Phone number is required'),
  body('practice_area').isArray().withMessage('Practice area must be an array'),
  body('certification').trim().notEmpty().withMessage('Certification is required'),
  validateRequest
];

export const validateGeneralSettings = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('phone').optional().trim().notEmpty().withMessage('Phone cannot be empty'),
  body('address').optional().trim().notEmpty().withMessage('Address cannot be empty'),
  body('copyright').optional().trim().notEmpty().withMessage('Copyright cannot be empty'),
  body('google_maps_api_key').optional().trim().notEmpty().withMessage('Google Maps API key cannot be empty'),
  validateRequest
];

export const validateEmailSettings = [
  body('provider').isIn(['sendgrid', 'gmail', 'other']).withMessage('Invalid email provider'),
  body('config.email_username').trim().notEmpty().withMessage('Email username is required'),
  body('config.email_password').trim().notEmpty().withMessage('Email password is required'),
  validateRequest
];

export const validateService = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  validateRequest
];

export const validateFAQ = [
  body('question').trim().notEmpty().withMessage('Question is required'),
  body('answer').trim().notEmpty().withMessage('Answer is required'),
  validateRequest
];

export const validateLanguage = [
  body('name').trim().notEmpty().withMessage('Language name is required'),
  body('code').trim().notEmpty().withMessage('Language code is required'),
  validateRequest
];

export const validateBlogCategory = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  validateRequest
];

export const validateBlogTag = [
  body('name').trim().notEmpty().withMessage('Tag name is required'),
  validateRequest
];

export const validateBlogPost = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('blog_category').trim().notEmpty().withMessage('Blog category is required'),
  body('short_description').trim().notEmpty().withMessage('Short description is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  validateRequest
];
