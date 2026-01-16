//@ts-nocheck

import { decodeToken, isAdmin } from "../middleware/auth.middleware";
import { getSettings, postSettings ,checkSettingEnv ,postSettingEnvBYAdmin  } from "../controllers/settings.controller";
import { Router } from "express";

const settingsRoutes = Router()

settingsRoutes.get('/', getSettings)
settingsRoutes.post('/create-env', postSettingEnvBYAdmin)
settingsRoutes.get('/check-env', checkSettingEnv)
// settingsRoutes.post('/create-env', decodeToken, isAdmin, postSettingEnvBYAdmin)

export default settingsRoutes