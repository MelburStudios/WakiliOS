import { decodeToken, isAdmin } from "../middleware/auth.middleware";
import { getMailSettings, postMailSettings } from "../controllers/mailCreadential.controller";
import { Router } from "express";


const mailSettingRoutes = Router()

mailSettingRoutes.get('/', getMailSettings)
mailSettingRoutes.post('/', decodeToken, isAdmin, postMailSettings)

export default mailSettingRoutes