//@ts-nocheck
import { decodeToken, isAdmin } from "../middleware/auth.middleware";
import { deletePage, getPage, getPages, postPage } from "../controllers/page";
import {Router} from "express";

const pageRoutes = Router()

pageRoutes.get('/list', decodeToken, isAdmin, getPages)
pageRoutes.get('/', getPage)
pageRoutes.post('/', decodeToken, isAdmin, postPage)
pageRoutes.delete('/', decodeToken, isAdmin, deletePage)

export default pageRoutes