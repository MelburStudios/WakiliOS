//@ts-nocheck
import { getOrDelContactValidator, patchContactValidator, postContactValidator } from "../middleware/contact.middleware";
import { Router } from "express";
import { decodeToken, isAdmin } from "../middleware/auth.middleware";
import { delContact, getContact, getContacts, postContact, postReplyContact } from "../controllers/contact.controller";

const contactRoutes = Router();

contactRoutes.get('/list',decodeToken ,isAdmin, getContacts)
contactRoutes.get('/', decodeToken ,isAdmin, getOrDelContactValidator, getContact)
contactRoutes.post('/', postContactValidator, postContact)
contactRoutes.post('/reply', decodeToken ,isAdmin, patchContactValidator, postReplyContact)
contactRoutes.delete('/', decodeToken ,isAdmin, getOrDelContactValidator, delContact)


export default contactRoutes;