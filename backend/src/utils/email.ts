import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import { config } from '../config/config';
import { AppError } from './appError';

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  // In development, just log the email
  if (config.env === 'development') {
    console.log('\n=== Development Mode Email ===');
    console.log('To:', options.email);
    console.log('Subject:', options.subject);
    console.log('Message:', options.message);
    console.log('============================\n');
    return;
  }

  try {
    // Check if SendGrid is configured
    if (config.email.sendgrid?.apiKey) {
      sgMail.setApiKey(config.email.sendgrid.apiKey);
      
      await sgMail.send({
        to: options.email,
        from: config.email.sendgrid.fromEmail || config.email.from || 'noreply@lawfirm.com',
        subject: options.subject,
        text: options.message,
        html: options.message
      });
      return;
    }

    // Check if SMTP is configured
    if (config.email.smtp) {
      const transporter = nodemailer.createTransport({
        host: config.email.smtp.host,
        port: config.email.smtp.port,
        auth: {
          user: config.email.smtp.auth.user,
          pass: config.email.smtp.auth.pass
        }
      });

      await transporter.sendMail({
        from: config.email.from || 'noreply@lawfirm.com',
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.message
      });
      return;
    }

    // If no email service is configured in production
    if (config.env === 'production') {
      console.error('No email service configured. Email not sent:', {
        to: options.email,
        subject: options.subject
      });
      throw new AppError('Email service not configured', 500);
    }
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new AppError('Failed to send email', 500);
  }
};
