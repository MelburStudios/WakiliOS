//@ts-nocheck
import { Router, Response, NextFunction, RequestHandler } from 'express';
import { Request } from 'express-serve-static-core';
import { UserController } from '../controllers/user.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { uploadToS3 } from '../middleware/upload.middleware';
import { RequestWithFile } from '../types/multer.types';
import {
  validateAppointment,
  validateMessage,
  validateProfile
} from '../validators/user.validator';

const router = Router();
const userController = new UserController();

router.use(protect);
router.use(authorize('user'));
router.get('/profile', userController.getProfile);
router.patch('/profile', validateProfile, userController.updateProfile as any);

router.get('/dashboard',protect , userController.getDashboardStats);
router.get('/attorneys', userController.getAttorneys);
router.post('/appointments', protect, validateAppointment, userController.bookAppointment);
router.get('/appointments/stripe-payment-success', userController.stripePaymentSuccess);
router.get('/appointments/paypal-payment-success', userController.paypalPaymentSuccess);
router.get('/appointments/count', userController.AppointmentCount);
router.get('/appointments-hearing',protect, userController.getAppointmentHearing);
router.get('/appointments-list', userController.getAppointments);
router.get('/appointments-details', userController.getAppointmentDetails);
router.post('/post-pdf', userController.postPdf);
router.get('/pdf-list',protect, userController.getPdfList);
router.get('/pdf-details', userController.getPdfDetails);
router.get('/appoinment-attorney-list', userController.getAppointmentAttorneyList);
router.get('/appointments/booking/slot', userController.getBookingSlot);

router.get('/cases', userController.getMyCases);
router.post('/case-request', protect, ...uploadToS3('file'),
  (req: Request, res: Response, next: NextFunction) => {
    const typedReq = req as RequestWithFile;
    return userController.submitCaseRequest(typedReq, res, next);
  }
);

export default router;
