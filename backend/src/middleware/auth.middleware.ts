import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { AppError } from './errorHandler';
import { User } from '../models/user.model';
import { error } from 'console';

interface JwtPayload {
  id: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: any;
      role?: string;
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('Invalid authorization header format', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AppError('No token provided', 401);
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    
    // Find user
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    req.user = user;
    req.role = user.role;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError('Invalid token', 401));
    }
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.role!)) {
      throw new AppError('Not authorized to access this route', 403);
    }
    next();
  };
};

export const decodeToken = (req: Request, res: Response, next: NextFunction) => {
  try {
      const token = req.headers?.authorization?.split(" ")[1] as string
      res.locals.user = jwt.verify(token, config.jwt.secret) as JwtPayload;
      next()
      return
  } catch (err) {
      next()
  }
}

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = res.locals.user;
  if (user.role === 'admin') {
      next();
  } else {
      res.status(401).send({
          error: true,
          msg: 'Unauthorized',
      });
  }
};
export const isAttorney = (req: Request, res: Response, next: NextFunction) => {
  const user = res.locals.user;
  
  if (user.role === 'attorney') {
      next();
  } else {
      res.status(401).send({
          error: true,
          msg: 'Unauthorized',
      });
  }
};

export const isAnyUser = (req: Request, res: Response, next: NextFunction) => {
  let { user } = res.locals
  if (!!user && (user.role === 'user' || user.role === 'admin' || user.role === 'attorney')) {
      next()
  } else {
      res.status(401).send({
          error: true,
          msg: 'Unauthorized'
      })
  }
}


export const isAdminOrAttorney = (req: Request, res: Response, next: NextFunction) => {
  let { user } = res.locals
  if (!!user && (user.role === 'admin' || user.role === 'attorney' )) {
      next()
  } else {
      res.status(401).send({
          error: true,
          msg: 'Unauthorized'
      })
  }
}