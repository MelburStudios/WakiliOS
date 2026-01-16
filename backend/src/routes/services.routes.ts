//@ts-nocheck
import { createService, delService, getService, getServiceDetails, getServices } from "../controllers/services/services.controller";
import { decodeToken, isAdmin, isAnyUser } from "../middleware/auth.middleware";
import { Router } from "express";

const ServiceRouter = Router();

// Service Management
ServiceRouter.post('/create', decodeToken,  isAdmin , createService);
ServiceRouter.get('/list', decodeToken,  isAnyUser , getServices);
ServiceRouter.get('/details', decodeToken,  isAnyUser , getServiceDetails);
ServiceRouter.delete('/', decodeToken, isAdmin, delService);

// public routes
ServiceRouter.get('/public/list', getServices);
ServiceRouter.get('/public/details', getServiceDetails);

export default ServiceRouter;