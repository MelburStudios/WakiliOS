import { Response } from 'express';

export class ApiResponse {
  static success(res: Response, message: string, data?: any, statusCode: number = 200) {
    return res.status(statusCode).json({
      error: false,
      msg: message,
      data: data || null
    });
  }

  static error(res: Response, message: string, statusCode: number = 400) {
    return res.status(statusCode).json({
      error: true,
      msg: message
    });
  }
} 