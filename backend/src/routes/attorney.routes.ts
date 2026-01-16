import { Router } from 'express';
import { AttorneyController } from '../controllers/attorney.controller';
import { protect, authorize } from '../middleware/auth.middleware';


const router = Router();
const attorneyController = new AttorneyController();

router.use(protect);
router.use(authorize('attorney'));

router.patch('/profile', attorneyController.updateProfile
);
router.get('/profile', attorneyController.getProfile
);
router.get('/dashboard', attorneyController.getDashboardStats);
router.get('/attorney-cases', attorneyController.getMyCases);
router.get('/attorney-case', attorneyController.getCases);
router.get('/appointments', attorneyController.getAppointments);
router.get('/appointments-details', attorneyController.getAppointmentDetails);
router.post('/appointments-status', attorneyController.caseStatusUpdate);
router.get('/my-cases', attorneyController.getMyCasesList);
router.get('/my-cases-details', attorneyController.getMyCasesDetails);
router.get('/get-client-list', attorneyController.getAppointmentsClientList)
router.get('/get-client-list-details', attorneyController.getAppinmentClientDetails)
router.get('/appointments-hearing',protect, attorneyController.getAppointmentHearing);
router.get('/appointments/booking/slot', attorneyController.getBookingSlot);



router.post('/availability', attorneyController.updateAvailability
);
router.get('/availability', attorneyController.getAvailability
);



export default router;
