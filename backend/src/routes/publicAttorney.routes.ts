//@ts-nocheck
import { getAttorney, getAttorneys } from "../controllers/publicAttorney.controller";
import { Router } from "express";

const publicAttorneyRoutes = Router();

publicAttorneyRoutes.get('/attorneys', getAttorneys)
publicAttorneyRoutes.get('/attorneys/details', getAttorney)

export default publicAttorneyRoutes;