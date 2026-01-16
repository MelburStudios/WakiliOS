//@ts-nocheck
import mongoose from "mongoose";
import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import { IAuthBase } from "../types/auth.types";
import { aggregatePaginate, paginate } from "../utils/mongoose";
import { number } from "joi";

interface Availability {
  weekDays: string[];
  timeSlots: {
    start: string;
    end: string;
  }[];
  breaks: {
    start: string;
    end: string;
  }[];
}

export interface IUser extends IAuthBase {
  postal_code?: string;
  country?: string;
  image?: string;
  phone_no?: string;
  dob?: Date;
  pre_address?: string;
  per_address?: string;
  otp?: string;
  otpExpires?: Date;
  // Attorney specific fields
  specialization?: string[];
  bio?: string;
  experience?: number;
  languages?: string[];
  status?: "active" | "inactive";
  active_cases?: number;
  pending_cases?: number;
  case_requests?: number;
  new_messages?: number;
  availability?: Availability;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    phone_no: { type: mongoose.Schema.Types.Mixed },
    dob: {
      type: Date,
      default: Date.now,
    },
    pre_address: { type: mongoose.Schema.Types.Mixed },
    per_address: { type: mongoose.Schema.Types.Mixed },
    role: {
      type: String,
      enum: ["user", "attorney", "admin"],
      default: "user",
    },
    postal_code: { type: mongoose.Schema.Types.Mixed },
    country: { type: mongoose.Schema.Types.Mixed },
    image: { type: mongoose.Schema.Types.Mixed },
    otp: { type: mongoose.Schema.Types.Mixed },
    otpExpires: { type: mongoose.Schema.Types.Mixed },
    // Attorney specific fields
    specialization: [String],
    bio: String,
    experience: Number,
    languages: [String],
    certifications: String,
    professional_experience: String,
    legal_experience: String,
    practice: String,
    designation: String,
    facebook: String,
    twitter: String,
    linkedin: String,
    instagram: String,
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    active_cases: {
      type: Number,
      default: 0,
    },
    pending_cases: {
      type: Number,
      default: 0,
    },
    case_requests: {
      type: Number,
      default: 0,
    }, 
    new_messages: {
      type: Number,
      default: 0,
    },
    price: String,
    availability: [
      {
        date: String,
        timeSlots: [String],
        bookingSlots: [String],
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error as Error);
  }
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Error comparing passwords");
  }
};
userSchema.plugin(paginate);
userSchema.plugin(aggregatePaginate);

export const User = model<IUser>("user", userSchema);
