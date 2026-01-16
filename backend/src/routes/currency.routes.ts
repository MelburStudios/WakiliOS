import { decodeToken, isAdmin } from "../middleware/auth.middleware";
import { delCurrency, getCurrencyList, postCurrency } from "../controllers/currency.controller";
import { Router } from "express";

const currencyRoutes = Router();

currencyRoutes.get('/list', getCurrencyList)
currencyRoutes.post('/', decodeToken, isAdmin, postCurrency)
currencyRoutes.delete('/', decodeToken, isAdmin, delCurrency)


export default currencyRoutes;