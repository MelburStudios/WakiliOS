import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";
import { config } from "../config/config";
import { UserRole } from "../types/auth.types";
import { ApiResponse } from "../utils/response.util";
import bcrypt from "bcryptjs";
import { sendUserEmailGeneral } from "../utils/userEmailsend";
interface JwtPayload {
  id: string;
  role: UserRole;
}

export class AuthController {
  private generateToken(payload: JwtPayload): string {
    const signOptions: jwt.SignOptions = {
      expiresIn: config.jwt.expiresIn as jwt.SignOptions["expiresIn"],
    };

    return jwt.sign(payload, config.jwt.secret as jwt.Secret, signOptions);
  }

  // User Authentication
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, role = "user" as const } = req.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return ApiResponse.error(res, "Email already exists", 400);
      }
      const user = await User.create({
        ...req.body,
        role,
      });
      const token = this.generateToken({
        id: user._id.toString(),
        role: user.role,
      });

      return ApiResponse.success(
        res,
        "User registered successfully",
        {
          token,
          user: {
            id: user._id,
            email: user.email,
            role: user.role,
          },
        },
        201
      );
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      console.log("Login request:", req.body);
      const { email, password, role = "user" } = req.body;
      const user = await User.findOne({ email }).select("+password");
      console.log(
        "Found user:",
        user ? { ...user.toObject(), password: "[HIDDEN]" } : null
      );
      if (!user) {
        return ApiResponse.error(res, "Invalid credentials", 401);
      }
      const isMatch = await user.comparePassword(password);
      console.log("Password match:", isMatch);

      if (!isMatch) {
        return ApiResponse.error(res, "Invalid credentials", 401);
      }

      // Generate token
      const token = this.generateToken({
        id: user._id.toString(),
        role: user.role,
      });

      return ApiResponse.success(res, "Login successful", {
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp } = req.body;

      const user: any = await User.findOne({
        email,
        otp,
        otpExpires: { $gt: new Date() },
      });

      if (!user) {
        return ApiResponse.error(res, "Invalid or expired OTP", 400);
      }

      // Create token
      const token = this.generateToken({
        id: user._id.toString(),
        role: user.role,
      });

      // Clear OTP
      await User.findByIdAndUpdate(user._id, {
        $unset: {
          otp: 1,
          otpExpires: 1,
        },
      });

      return ApiResponse.success(res, "Email verified successfully", {
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      console.log("Starting forgot password process...");
      const { email, role = "user" as const } = req.body;
      console.log("Looking for user with email:", email);

      // Get user
      const user = await User.findOne({ email });
      console.log("User found:", user ? "Yes" : "No");

      if (!user) {
        console.log("User not found, returning 404");
        return ApiResponse.error(res, "User not found with this email", 404);
      }

      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      console.log("Generated OTP:", otp);

      try {
        // Save OTP to user
        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();
        console.log("OTP saved to user");

        // Send email
        const message = `Your password reset OTP is ${otp}. This OTP will expire in 10 minutes.`;
        console.log("Attempting to send email...");
        await sendUserEmailGeneral({
          email: user.email,
          subject: "Password Reset OTP",
          message,
        });
        console.log("Email sent successfully");

        return ApiResponse.success(res, "OTP sent to email", {
          otp: user.otp,
        });
      } catch (saveError) {
        console.error("Error in save/email process:", saveError);
        return ApiResponse.error(
          res,
          "Error processing password reset request",
          500
        );
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { newPassword, confirmPassword, token } = req.body;
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      if (!decoded) return ApiResponse.error(res, "Invalid Token", 400);
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return ApiResponse.error(res, "User not found", 400);
      }

      if (newPassword != confirmPassword) {
        return ApiResponse.error(res, "Password can not metach", 400);
      }

      // Validate new password length
      if (newPassword.length < 6) {
        return ApiResponse.error(
          res,
          "Password must be at least 6 characters",
          400
        );
      }
      user.password = newPassword;

      await user.save();

      return ApiResponse.success(res, "Password reset successful");
    } catch (error) {
      console.error("Reset password error:", error);
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const user = await User.findById(userId).select(
        "-password -otp -otpExpires"
      );

      if (!user) {
        return ApiResponse.error(res, "User not found", 404);
      }

      return res.status(200).send({
        error: false,
        msg: "User profile retrieved successfully",
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone_no: user.phone_no,
          country: user.country,
          postal_code: user.postal_code,
          pre_address: user.pre_address,
          per_address: user.per_address,
          image: user.image,
          dob: user.dob,

          ...(user.role === "attorney" && {
            specialization: user.specialization,
            bio: user.bio,
            experience: user.experience,
            languages: user.languages,
            active_cases: user.active_cases,
            pending_cases: user.pending_cases,
            availability: user.availability,
            certifications: user.certifications,
            professional_experience: user.professional_experience,
            legal_experience: user.legal_experience,
            practice: user.practice,
            designation: user.designation,
            facebook: user.facebook,
            twitter: user.twitter,
            linkedin: user.linkedin,
            instagram: user.instagram,
          }),
        },
      });
    } catch (error) {
      next(error);
    }
  }
  async updatePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { oldPassword, newPassword } = req.body;
      const user: any = await User.findById(userId).select("+password");
      if (!user) {
        return ApiResponse.error(res, "User not found", 404);
      }
      // Check old password
      const isMatch = await user.comparePassword(oldPassword);
      if (!isMatch) {
        return ApiResponse.error(res, "Incorrect old password", 400);
      }

      // Update password
      user.password = newPassword;
      await user.save();

      return ApiResponse.success(res, "Password updated successfully");
    } catch (error) {
      next(error);
    }
  }
}
