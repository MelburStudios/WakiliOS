import { decodeToken, isAdmin } from "../middleware/auth.middleware";
import { delFaq, getFaq, getFaqs, postFaq } from "../controllers/faq.controller";
import { Router } from "express";



const faqRoutes = Router();

faqRoutes.get('/list', getFaqs)
faqRoutes.get('/', getFaq)
faqRoutes.post('/',decodeToken, isAdmin, postFaq)
faqRoutes.delete('/', decodeToken, isAdmin, delFaq)

export default faqRoutes;