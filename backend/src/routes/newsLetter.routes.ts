//@ts-nocheck
import { deleteNewsletter, getNewsletters, postNewsletter } from "../controllers/newsLetter.controller";
import { decodeToken, isAdmin } from "../middleware/auth.middleware";
import { Router } from "express";

const newsletterRoutes = Router();

newsletterRoutes.get('/list', decodeToken, isAdmin, getNewsletters)
newsletterRoutes.post('/',  postNewsletter)
newsletterRoutes.delete('/', decodeToken, isAdmin, deleteNewsletter)

export default newsletterRoutes;



