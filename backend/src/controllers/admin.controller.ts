//@ts-nocheck
import { Request, Response, NextFunction } from "express";
import { User } from "../models/user.model";
import { Settings } from "../models/settings.model";
import { Service } from "../models/service.model";
import { FAQ } from "../models/faq.model";
import { Language } from "../models/language.model";
import { Case } from "../models/case.model";
import { AppError } from "../middleware/errorHandler";
import bcrypt from "bcryptjs";
import { ApiResponse } from "../utils/response.util";
import { s3DeleteFiles } from "../utils/s3";
import Contact from "../models/contact.model";
import { Appointment } from "../models/appointment.model";
import PaymentMethod from "../models/paymentMethod.model";
import path from "path";
import Message from "../models/message/message.model";
import { group } from "console";
import { pipeline } from "stream";
import mongoose from "mongoose";

export class AdminController {
  async createOrUpdateAttorney(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { _id, password, ...attorneyData } = req.body;

      if (_id) {
        // Update existing attorney
        const updateData: any = { ...attorneyData };

        if (password) {
          if (typeof password !== "string" || password.trim() === "") {
            return ApiResponse.error(res, "Invalid password", 400);
          }
          const salt = await bcrypt.genSalt(10);
          updateData.password = await bcrypt.hash(password, salt);
        }

        const updatedAttorney = await User.findByIdAndUpdate(_id, updateData, {
          new: true,
          runValidators: true,
        });

        if (!updatedAttorney) {
          return ApiResponse.error(res, "Attorney not found", 404);
        }

        return ApiResponse.success(res, "Attorney updated successfully", {
          updatedAttorney,
        });
      } else {
        if (
          !password ||
          typeof password !== "string" ||
          password.trim() === ""
        ) {
          return ApiResponse.error(res, "Password is required", 400);
        }

        const attorney = new User({
          ...attorneyData,
          password: password,
          role: "attorney",
        });

        await attorney.save();

        return ApiResponse.success(
          res,
          "Attorney created successfully",
          { attorney },
          201
        );
      }
    } catch (error) {
      next(error);
    }
  }

  async getAttorneys(req: Request, res: Response, next: NextFunction) {
    console.log("🚀 ~ AdminController ~ getAttorneys ~ res:", res);
    try {
      const { query } = req;
      const filter: any = { role: "attorney" };

      if (!!query.search) {
        const searchRegex = new RegExp(query.search.toLowerCase(), "i");
        filter["$or"] = [
          { name: searchRegex },
          { email: searchRegex },
          { phone_no: searchRegex },
        ];
      }

      let data = await User.paginate(filter, {
        page: query.page || 1,
        limit: query.limit || 10,
        sort: { createdAt: -1 },
        select: "-__v",
      });

      return res.status(200).send({
        error: false,
        msg: "Successfully retrieved attorneys",
        data,
      });
    } catch (error) {
      return ApiResponse.error(res, "Internal Server Error", 500);
    }
  }

  async getAttorney(req: Request, res: Response, next: NextFunction) {
    try {
      const { query } = req;
      let data = await User.findOne({ _id: query._id });
      if (!data) {
        return ApiResponse.error(res, "Attorney not found", 404);
      }
      return res.status(200).send({
        error: false,
        msg: "Successfully gets Attorney",
        data,
      });
    } catch (error) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  async deleteAttorney(req: Request, res: Response, next: NextFunction) {
    try {
      const { query } = req;
      const data = await User.findOne({
        _id: query._id,
      });

      if (!data) {
        return ApiResponse.error(res, "Attorney not found", 404);
      }
      if (data.image) {
        await s3DeleteFiles([data.image]);
      }
      await User.findOneAndDelete({ _id: query._id });
      return res.status(200).send({
        error: false,
        msg: "Successfully deleted Attorney",
      });
    } catch (error) {
      return res.status(500).send({
        error: true,
        msg: "Internal server error",
      });
    }
  }

  async getAttorneyHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const attorney = await User.findOne({
        _id: req.params.id,
        role: "attorney",
      }).select("-password");

      if (!attorney) {
        return ApiResponse.error(res, "Attorney not found", 404);
      }

      const historyData = {
        attorney,
        active_cases: attorney.active_cases || 0,
        pending_cases: attorney.pending_cases || 0,
        case_requests: attorney.case_requests || 0,
        new_messages: attorney.new_messages || 0,
      };

      return ApiResponse.success(
        res,
        "Attorney history retrieved successfully",
        historyData
      );
    } catch (error) {
      next(error);
    }
  }

  async updateEmailSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await Settings.findOneAndUpdate(
        {},
        { email: req.body },
        { new: true, upsert: true }
      );

      return ApiResponse.success(res, "Email settings updated successfully", {
        settings,
      });
    } catch (error) {
      next(error);
    }
  }

  // Page Content Management
  async updatePageContent(req: Request, res: Response, next: NextFunction) {
    try {
      const { page } = req.params;
      const { content } = req.body;

      const settings = await Settings.findOneAndUpdate(
        {},
        { [`pages.${page}`]: content },
        { new: true, upsert: true }
      );

      return ApiResponse.success(res, "Page content updated successfully", {
        settings,
      });
    } catch (error) {
      next(error);
    }
  }

  async getContactSubmissions(req: Request, res: Response, next: NextFunction) {
    try {
      const contacts = await Contact.find().sort("-createdAt");
      return ApiResponse.success(
        res,
        "Contact submissions retrieved successfully",
        { contacts }
      );
    } catch (error) {
      next(error);
    }
  }

  async updateContactStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const contact = await Contact.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );

      if (!contact) {
        return ApiResponse.error(res, "Contact not found", 404);
      }

      return ApiResponse.success(res, "Contact status updated successfully", {
        contact,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const attorney = await User.findOne({
        _id: req.user._id,
        role: "admin",
      }).select("-password");

      if (!attorney) {
        return ApiResponse.error(res, "Admin not found", 404);
      }

      return ApiResponse.success(res, "Admin profile retrieved successfully", {
        attorney,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user._id) {
        return ApiResponse.error(res, "Unauthorized", 401);
      }

      const { password, ...updateData } = req.body;

      // Hash password if being updated
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      const admin = await User.findOneAndUpdate(
        { _id: req.user._id, role: "admin" },
        updateData,
        { new: true }
      ).select("-password");

      if (!admin) {
        return ApiResponse.error(res, "Admin not found", 404);
      }

      return ApiResponse.success(res, "Profile updated successfully", {
        admin,
      });
    } catch (error) {
      console.error(error);
      return ApiResponse.error(res, "Something went wrong", 500);
    }
  }
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const totalBalance = await Appointment.aggregate([
        { $match: { "payment.status": "paid" } },
        { $group: { _id: null, total: { $sum: "$payment.amount" } } },
      ]);

      const monthlyAppointments = await Appointment.aggregate([
        {
          $group: {
            _id: { $month: "$createdAt" },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      // Map month numbers to month names
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const monthlyData = monthlyAppointments.map((item) => ({
        month: monthNames[item._id - 1],
        cases: item.count,
      }));
      const case_analytics = {
        confirmed_cases:
          ((await Appointment.countDocuments({
            "payment.status": "paid",
            status: "confirmed",
          })) /
            100) *
          100,
        completed_cases:
          ((await Appointment.countDocuments({
            "payment.status": "paid",
            status: "completed",
          })) /
            100) *
          100,
      };
      const weekdayPayments = await Appointment.aggregate([
        { $match: { "payment.status": "paid" } },
        {
          $group: {
            _id: { $dayOfWeek: "$createdAt" }, // Day of the week (1 = Sunday, 7 = Saturday)
            total: { $sum: "$payment.amount" },
          },
        },
        { $sort: { _id: 1 } }, // Sort by weekday
      ]);
      const cases = await Appointment.aggregate([
        {
          $group: {
            _id: "$status",
            total: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } }, // Sort by weekday
      ]);

      // Map weekday numbers to names
      const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const weekdayData = weekdayPayments.map((item, index, array) => {
        const previousDayTotal = index > 0 ? array[index - 1].total : 0; // Get the previous day's total
        return {
          weekday: weekdayNames[item._id - 1],
          total_payment: item.total,
          previousDay: previousDayTotal,
        };
      });
      const top_deals = await Appointment.aggregate([
        {
          $sort: { "payment.amount": -1 },
        },
        {
          $addFields: {
            case: "$_id",
          },
        },
        {
          $group: {
            _id: "$user",
            case: { $first: "$case" },
            payment: { $first: "$payment" },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  name: 1,
                  email: 1,
                  image: 1,
                },
              },
            ],
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: true,
          },
        },
      ]);
      // .populate("user", "name image email");
      const top_clients = await Appointment.aggregate([
        {
          $match: {
            status: "confirmed",
          },
        },
        {
          $group: {
            _id: "$user",
            payment :{$first : "$payment"},
            total: { $sum: 1 },
          },
        },
        {
          $sort: { total: -1 },
        },
        {
          $project: {
            _id: 0,
            payment:1,
            user: "$_id",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            pipeline: [
              {
                $project: {
                  name: 1,
                  email: 1,
                  image: 1,
                  _id: 0,
                },
              },
            ],
            as: "user",
          },
        },
        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: true,
          },
        },
      ]);
      // .limit(5)
      // .select("user")
      // .populate("user", "name image email");
      const upcoming_cases = await Appointment.find({
        select_date: {
          $gte: new Date(),
        },
      })
        .limit(5)
        .select("user select_date")
        .populate("user", "name image email");
      const data = {
        total_attorneys: await User.countDocuments({ role: "attorney" }),
        // total_cases: await Case.countDocuments(),
        total_clients: await User.countDocuments({ role: "user" }),
        top_messages: await Message.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .populate("to", "image name")
          .populate("from", "name image"),
        total_balance: totalBalance.length > 0 ? totalBalance[0].total : 0,
        // total_appointments: await Appointment.countDocuments(),
        monthly_appointments: monthlyData,
        case_analytics: case_analytics,
        profit_earned: weekdayData,
        confirm_cases: cases.find((data) => data._id == "confirmed")?.total || 0,
        completed_cases: cases.find((data) => data._id == "completed")?.total || 0,
        top_deals,
        top_clients,
        upcoming_cases,
      };
      return ApiResponse.success(res, "Dashboard retrieved successfully", data);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async getPaymentList(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query;
      const filter = {};
      if (query.status) {
        filter["payment.status"] = query.status;
      }
      if (query.search) {
        filter["$or"] = [
          { "payment.method": { $regex: new RegExp(query.search, "i") } },
          { "user.name": { $regex: new RegExp(query.search, "i") } },
        ];
      }

      const data = await Appointment.aggregatePaginate([
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "attorney",
            pipeline: [],
            foreignField: "_id",
            as: "attorney",
          },
        },
        {
          $unwind: {
            path: "$attorney",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: filter,
        },
      ]);
      return ApiResponse.success(
        res,
        "Payment list retrieved successfully",
        data
      );
    } catch (error) {
      console.error("Error fetching payment list:", error);
      return ApiResponse.error(res, "Internal Server Error", 500);
    }
  }
  async getMyCasesDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { query } = req;
      let data = await Appointment.findOne({ _id: new mongoose.Types.ObjectId(query._id) }).populate("user");
      if (!data) {
        return res.status(400).send({
          error: true,
          msg: "Appointment not found",
        });
      }
      return res.status(200).send({
        error: false,
        msg: "Successfully get appointment details",
        data,
      });
    } catch (e) {
      return res.status(500).send({
        error: true,
        msg: "Internal Server Error",
      });
    }
  }
}
