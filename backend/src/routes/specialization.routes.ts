//@ts-nocheck
import { decodeToken, isAdmin } from "../middleware/auth.middleware"; 
import { delSpecialization, getSpecializations, postSpecialization,  } from "../controllers/specialization.controller";
import { Router } from "express";

const SpecializationRouter = Router();

SpecializationRouter.get('/list', getSpecializations);
SpecializationRouter.post('/', decodeToken, isAdmin, postSpecialization);
SpecializationRouter.delete('/', decodeToken, isAdmin, delSpecialization );

export default SpecializationRouter;