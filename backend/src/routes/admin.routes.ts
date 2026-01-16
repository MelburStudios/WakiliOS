// Import necessary modules and middleware
import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { protect, authorize, isAdmin, decodeToken } from '../middleware/auth.middleware';
import {
  validateEmailSettings,
} from '../validators/admin.validator';

const router = Router();
const adminController = new AdminController();


// Protect all routes after this middleware
router.use(protect);
router.use(authorize('admin'));
router.post('/attorneys', decodeToken, isAdmin, adminController.createOrUpdateAttorney);
router.get('/attorneys', decodeToken, isAdmin, adminController.getAttorneys);
router.get('/attorneys/details', decodeToken, isAdmin, adminController.getAttorney);
router.delete('/attorneys', decodeToken, adminController.deleteAttorney);
router.get('/attorneys/:id/history', decodeToken, adminController.getAttorneyHistory);
router.get('/get-dashboard', decodeToken, isAdmin, adminController.getDashboard);
router.get('/get-payment-list', decodeToken, isAdmin, adminController.getPaymentList);
router.get('/get-my-cases-admindetails', decodeToken, isAdmin, adminController.getMyCasesDetails);

// Settings Management

router.patch(
  '/settings/email',
  validateEmailSettings,
  adminController.updateEmailSettings
);

router.patch(
  '/pages/:page',
  adminController.updatePageContent
);

router.get('/contacts', adminController.getContactSubmissions);
router.patch('/contacts/:id/status', adminController.updateContactStatus);
router.put('/users/:id', (req, res) => {
  // Your code to update a user   
});

// router.delete('/users/:id', (req, res) => {
  // Your code to delete a user

router.patch('/profile', adminController.updateProfile);
router.get('/profile', adminController.getProfile)



export default router;
