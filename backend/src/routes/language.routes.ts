import { deleteLanguage, getLanguage, getLanguageList, getLanguageTranslations, getPublicLanguageList, postLanguage, translateLanguage } from "./../controllers/language.controllers";
import { decodeToken, isAdmin } from "../middleware/auth.middleware";

import {Router} from "express";;

const languageRoutes = Router();

languageRoutes.get('/list', getLanguageList);
languageRoutes.get('/translations', getLanguageTranslations);
languageRoutes.get('/',decodeToken, isAdmin, getLanguage);
languageRoutes.post('/', decodeToken , isAdmin, postLanguage);
languageRoutes.delete('/',decodeToken, isAdmin, deleteLanguage);
languageRoutes.post('/translate', translateLanguage)
languageRoutes.get('/languages', getPublicLanguageList)
export default languageRoutes;



