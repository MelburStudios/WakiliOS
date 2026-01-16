//@ts-nocheck
import dotenv from 'dotenv';
import MailSettings from '../models/mailCreadiental.model';
const nodemailer = require("nodemailer");

dotenv.config();

export const sendUserEmailGeneral = async (data) => {
  const settings = await MailSettings.findOne({});
  let transporter, from_email;

  if (settings?.default === 'sendgrid') {
    transporter = nodemailer.createTransport({
      host: settings?.sendgrid?.host,
      port: settings?.sendgrid?.port,
      secure: false,
      auth: {
        user: settings?.sendgrid?.sender_email,
        pass: settings?.sendgrid?.password,
      },
      tls: {
        rejectUnauthorized: false, // 👈 Ignore self-signed cert error
      },
      logger: true, // Optional: shows SMTP logs
      debug: true,  // Optional: shows debug output
    });

    from_email = settings?.sendgrid?.sender_email;

  } else if (settings?.default === 'gmail') {
    transporter = nodemailer.createTransport({
      service: settings?.gmail?.service_provider || 'gmail',
      secure: false,
      auth: {
        user: settings?.gmail?.auth_email,
        pass: settings?.gmail?.password,
      },
      tls: {
        rejectUnauthorized: false, 
      },
      logger: true,
      debug: true,
    });

    from_email = settings?.gmail?.auth_email;
  }

  // Validate
  if (!transporter || !from_email) {
    throw new Error("Mail transporter or sender email is not configured properly");
  }

  // Send email
  const info = await transporter.sendMail({
    from: from_email,
    to: data.email,
    subject: data.subject || "No Subject",
    html: data.message,
  });

  return info;
};