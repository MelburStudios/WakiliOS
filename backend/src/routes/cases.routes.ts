//@ts-nocheck
import { createCase, deleteCase, getCaseDetails, getCases } from "../controllers/cases/cases.controller";
import { Router } from "express";
import { decodeToken, isAdmin, isAnyUser } from "../middleware/auth.middleware";

const CaseRouter = Router();

CaseRouter.post('/create', decodeToken, isAdmin, createCase);
CaseRouter.get('/list', decodeToken, isAnyUser, getCases);
CaseRouter.get('/details', decodeToken, isAnyUser, getCaseDetails);
CaseRouter.delete('/', decodeToken, isAdmin, deleteCase);

//public routes
CaseRouter.get('/public/list', getCases);
CaseRouter.get('/public/details', getCaseDetails);

export default CaseRouter;
