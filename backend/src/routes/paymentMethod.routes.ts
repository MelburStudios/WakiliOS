import { decodeToken, isAdmin, isAnyUser } from "../middleware/auth.middleware";
import { deletePaymentMethod, getPaymentMethod, getPaymentMethods, getPaymentUserMethods, postPaymentMethod } from "../controllers/pamentMethod.controller";
import { Router } from "express";
import { getOrDelPaymentMethodValidator, postPaymentMethodValidator } from "../middleware/paymentMethod.middleware";

const paymentRoutes = Router();


paymentRoutes.get('/method/list', decodeToken, isAdmin, getPaymentMethods)
paymentRoutes.get('/method', decodeToken, isAdmin, getOrDelPaymentMethodValidator, getPaymentMethod)
paymentRoutes.post('/method', decodeToken, isAdmin, postPaymentMethodValidator, postPaymentMethod)
paymentRoutes.delete('/method', decodeToken, isAdmin, getOrDelPaymentMethodValidator, deletePaymentMethod)
paymentRoutes.get('/method/user/list', decodeToken, isAnyUser, getPaymentUserMethods)

export default paymentRoutes;