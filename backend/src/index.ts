//@ts-nocheck
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { swaggerUi, swaggerSpec } from './swagger';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import attorneyRoutes from './routes/attorney.routes';
import adminRoutes from './routes/admin.routes';
import { errorHandler } from './middleware/error.middleware';
import { config } from './config/config';
import languageRoutes from './routes/language.routes';
import filesRoutes from './routes/file.routes';
import fileUpload from 'express-fileupload';
import blogRoutes from './routes/blog.routes.';
import ServiceRouter from './routes/services.routes';
import CaseRouter from './routes/cases.routes';
import currencyRoutes from './routes/currency.routes';
import settingsRoutes from './routes/settings.routes';
import faqRoutes from './routes/faq.routes';
import pageRoutes from './routes/page.routes';
import newsletterRoutes from './routes/newsLetter.routes';
import testimonialRoutes from './routes/testimonial.routes';
import mailSettingRoutes from './routes/mailCredential.routes';
import contactRoutes from './routes/contact.routes';
import SpecializationRouter from './routes/specialization.routes';
import paymentRoutes from './routes/paymentMethod.routes';
import publicAttorneyRoutes from './routes/publicAttorney.routes';
import messageRoutes from './routes/message.routes';
import { createServer,Server } from 'http';
import { socket } from './utils/socket';
import { decodeToken } from './middleware/auth.middleware';

const app = express();
const httpServer = createServer(app);

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// CORS Configuration
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 hours
}));

app.use(decodeToken)
// Handle preflight requests
app.options('*', cors({
  origin: "*",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400
}));

app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// Connect to MongoDB and Start Server

const startServer = async () => {
  try {

    if(config.mongoUri) {
       await mongoose.connect(config.mongoUri);
      console.log('Connected to MongoDB');
    }else{
      console.log('mongo url not found');
    }
    const server = new Server(app);
    httpServer.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
      console.log(`API Documentation available at http://localhost:${config.port}/api-docs`);
    });

    // Handle unhandled rejections
    process.on('unhandledRejection', (err: Error) => {
      console.error('UNHANDLED REJECTION! 💥 Shutting down...');
      console.error(err.name, err.message);
      httpServer.close(() => {
        process.exit(1);
      });
    });

  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};
startServer();

const { notify, io } = socket(httpServer);

app.use((req, res, next) => {
  res.locals.notify = notify;
  res.locals.io = io;
  next();
});
// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Legal Services API Documentation'
}));

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/attorney', attorneyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/language', languageRoutes);
app.use('/api/file', filesRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/service', ServiceRouter)
app.use('/api/cases', CaseRouter)
app.use('/api/currency', currencyRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/faqs', faqRoutes)
app.use('/api/pages', pageRoutes)
app.use('/api/newsletter', newsletterRoutes)
app.use('/api/testimonial', testimonialRoutes)
app.use('/api/mail-credentials', mailSettingRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/specialization', SpecializationRouter)
app.use('/api/payment', paymentRoutes)
app.use('/api/public', publicAttorneyRoutes)
app.use('/api/message', messageRoutes)


// Error Handling
app.use(errorHandler);