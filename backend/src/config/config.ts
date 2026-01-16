//@ts-nocheck
import dotenv from 'dotenv';
import { SignOptions, JwtPayload, verify } from 'jsonwebtoken';

dotenv.config();

interface Config {
  jwtSecret(token: string, jwtSecret: any): JwtPayload;
  env: string;
  port: number;
  mongoUri: string;
  frontendUrl: string;
  jwt: {
    secret: string;
    expiresIn: string;
  };
  email: {
    from: string;
    sendgrid?: {
      apiKey?: string;
      fromEmail?: string;
    };
    smtp?: {
      host: string;
      port: number;
      auth: {
        user: string;
        pass: string;
      };
    };
  };
  stripe: {
    secretKey?: string;
    webhookSecret?: string;
  };
  aws: {
    bucketName: string;
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
  };
  clientUrl: string;
  cors: {
    origins: string[];
    credentials: boolean;
  };
}

export const config: Config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 8985,
  mongoUri: process.env.MONGODB_URI ,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  email: {
    from: process.env.EMAIL_FROM || 'noreply@lawfirm.com',
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY,
      fromEmail: process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_FROM || 'noreply@lawfirm.com'
    },
    smtp: process.env.SMTP_HOST ? {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    } : undefined
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
  },
  paypal: {
    clientId: process.env.PAYPAL_CLIENT_ID,
    clientSecret: process.env.PAYPAL_CLIENT_SECRET,
    mode: process.env.PAYPAL_MODE
  },

  aws: {
    bucketName: process.env.AWS_BUCKET_NAME || '',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'eu-central-1'
  },
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000' || 'http://localhost:3001',
  cors: {
    origins: (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173' || 'http://localhost:3001' ).split(','),
    credentials: true
  },
  jwtSecret: (token: string, jwtSecret: any): JwtPayload => {
    return verify(token, jwtSecret) as JwtPayload;
  }
};
