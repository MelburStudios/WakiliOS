//@ts-nocheck
import { Router } from "express";
import { fileRemoveFromAws, multipleImageUpload, pdfUpload, singleImageUpload } from "../controllers/file.controller";
import { decodeToken, isAdmin, isAdminOrAttorney, isAnyUser } from "../middleware/auth.middleware";


const filesRoutes = Router();

filesRoutes.post('/single-image-upload', singleImageUpload)
filesRoutes.post('/pdf-upload',  pdfUpload)
filesRoutes.post('/file-remove',  fileRemoveFromAws)
filesRoutes.post('/multiple-image-upload', multipleImageUpload)

export default filesRoutes;
