import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from '../utils/appError';

const signupSchema = Joi.object({
  name: Joi.string().required().min(2).max(50),
  email: Joi.string().required().email(),
  password: Joi.string().required().min(8),
  role: Joi.string().valid('user', 'attorney').default('user')
});

const loginSchema = Joi.object({
  email: Joi.string().required().email(),
  password: Joi.string().required(),
  role: Joi.string().valid('user', 'attorney', 'admin').default('user')
});

const otpSchema = Joi.object({
  email: Joi.string().required().email(),
  otp: Joi.string().required().length(6).pattern(/^[0-9]+$/).messages({
    'string.pattern.base': 'OTP must contain only numbers'
  })
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().required().email()
});

const resetPasswordSchema = Joi.object({
  newPassword: Joi.string().required(),
  confirmPassword: Joi.string().required(),
  token: Joi.string().required()
});

const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      const message = error.details.map((detail: Joi.ValidationErrorItem) => detail.message).join(', ');
      return next(new AppError(message, 400));
    }
    next();
  };
};

export const validateSignup = validateRequest(signupSchema);
export const validateLogin = validateRequest(loginSchema);
export const validateOtp = validateRequest(otpSchema);
export const validateForgotPassword = validateRequest(forgotPasswordSchema);
export const validateResetPassword = validateRequest(resetPasswordSchema);
