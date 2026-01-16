import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import {
  validateSignup,
  validateLogin,
  validateOtp,
  validateForgotPassword,
  validateResetPassword,
} from "../validators/auth.validator";
import { protect } from "../middleware/auth.middleware";

const router = Router();
const authController = new AuthController();

router.use((req, res, next) => {
  console.log("Auth Route:", req.method, req.path);
  next();
});

router.post("/signup", validateSignup, (req, res, next) =>
  authController.signup(req, res, next)
);
router.post("/login", validateLogin, (req, res, next) =>
  authController.login(req, res, next)
);
router.post("/verify-email", validateOtp, (req, res, next) =>
  authController.verifyEmail(req, res, next)
);
router.post("/forgot-password", validateForgotPassword, (req, res, next) => {
  console.log("Handling forgot password request:", req.body);
  return authController.forgotPassword(req, res, next);
});
router.post("/reset-password", validateResetPassword, (req, res, next) =>
  authController.resetPassword(req, res, next)
);
router.get("/profile", protect, (req, res, next) =>
  authController.getProfile(req, res, next)
);
router.put("/update-password", protect, (req, res, next) =>
  authController.updatePassword(req, res, next)
);

export default router;
