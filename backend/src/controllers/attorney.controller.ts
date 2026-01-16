//@ts-nocheck
import { Request, Response, NextFunction } from "express";
import { User } from "../models/user.model";
import { Case } from "../models/case.model";
import { Appointment } from "../models/appointment.model";
import { ApiResponse } from "../utils/response.util";
import Message from "../models/message/message.model";
import { populate } from "dotenv";
import mongoose from "mongoose";
import moment from "moment";

export class AttorneyController {
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const attorney = await User.findOne({
        _id: req.user._id,
        role: "attorney",
      }).select("-password");

      if (!attorney) {
        return ApiResponse.error(res, "Attorney not found", 404);
      }

      return ApiResponse.success(
        res,
        "Attorney profile retrieved successfully",
        { attorney }
      );
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { password, ...updateData } = req.body;
      const attorney = await User.findOneAndUpdate(
        { _id: req.user._id, role: "attorney" },
        updateData,
        { new: true }
      ).select("-password");

      if (!attorney) {
        return ApiResponse.error(res, "Attorney not found", 404);
      }

      return ApiResponse.success(res, "Attorney profile updated successfully", {
        attorney,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCases(req: Request, res: Response, next: NextFunction) {

    try {
      const attorney = await User.findOne({
        _id: req.user._id,
        role: "attorney",
      }).select("-password");

      if (!attorney) {
        return ApiResponse.error(res, "Attorney not found", 404);
      }
      return ApiResponse.success(res, "Attorney cases retrieved successfully", {
        active_cases: attorney.active_cases || 0,
        pending_cases: attorney.pending_cases || 0,
        case_requests: attorney.case_requests || 0,
      });
    } catch (error) {
      next(error);
    }
  }

  // Dashboard Statistics
  async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const [activeCases, pendingCases, caseRequests, messages, clients] =
        await Promise.all([
          Case.countDocuments({ attorney: req.user._id, status: "active" }),
          Case.countDocuments({ attorney: req.user._id, status: "pending" }),
          Appointment.countDocuments({
            attorney: req.user._id,
            status: "pending",
          }),
          Message.countDocuments({ receiver: req.user._id, read: false }),
          User.countDocuments({ role: "user" }),
        ]);

     
      const nextAppointments = await Appointment.find({
        attorney: req.user._id,
        status: "confirmed",
        select_date: { $gte: new Date() },
      })
        // .select("user date time")
        .limit(5)
        .populate("user", "name email phone image");
      const unreadMessages = await Message.find({
        to: req.user._id,
        seen: false,
      })
        .sort("-createdAt")
        .limit(5)
        .populate("to", "name email image")
        .populate("from", "name email image ");

      const totalClients = await Appointment.aggregate([
        { $match: { attorney: req.user._id } }, 
        {
          $group: {
            _id: "$user", 
            caseCount: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        { $unwind: "$userDetails" }, 
        {
          $project: {
            _id: 0,
            userId: "$_id",
            name: "$userDetails.name",
            email: "$userDetails.email",
            phone: "$userDetails.phone",
            image: "$userDetails.image",
            caseCount: 1,
          },
        },
      ]);

      const caseOverview = await Appointment.aggregate([
        { $match: { "payment.status": "paid", attorney: req.user._id } }, // Match appointments with paid status for the current attorney
        {
          $group: {
            _id: "$status", // Group by status
            count: { $sum: 1 }, // Count the number of appointments for each status
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$count" }, // Calculate the total number of appointments
            statuses: { $push: { status: "$_id", count: "$count" } }, // Push each status and its count into an array
          },
        },
        {
          $project: {
            _id: 0,
            total: 1,
            statuses: {
              $map: {
                input: "$statuses",
                as: "status",
                in: {
                  status: "$$status.status",
                  count: "$$status.count",
                  percentage: {
                    $multiply: [{ $divide: ["$$status.count", "$total"] }, 100],
                  },
                },
              },
            },
          },
        },
      ]);

      return ApiResponse.success(
        res,
        "Dashboard statistics retrieved successfully",
        {
          // activeCases,
          // pendingCases,
          // caseRequests,
          // newMessages: messages,
          // upcomingHearings,
          nextAppointments,
          unreadMessages,
          totalClients,
          caseOverview,
        }
      );
    } catch (error) {
      next(error);
    }
  }
  // Case Management
  async getMyCases(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.query;
      const query: { attorney: any; status?: string } = {
        attorney: req.user.id,
      };

      if (status) {
        query.status = status as string;
      }

      const cases = await Case.find(query)
        .populate("client", "name email")
        .sort("-createdAt");

      return ApiResponse.success(res, "Cases retrieved successfully", {
        cases,
      });
    } catch (error) {
      next(error);
    }
  }

  // Appointment Management
  async getAppointments(req: Request, res: Response, next: NextFunction) {
    try {
      const { query } = req;
      const filter = { attorney: req.user._id, status: "confirmed" };
      if (!!query.search) {
        filter[`name`,'case_type'] = {
          $regex: new RegExp(query.search.toLowerCase(), "i"),
        };
      }
      let data = await Appointment.paginate(filter, {
        page: query.page || 1,
        limit: query.limit || 10,
        sort: { createdAt: -1 },
        select: "-__v",
        populate: [
          {
            path: "user",
            select: "name email image",
          },
        ],
      });
      return res.status(200).send({
        error: false,
        msg: "Successfully gets Appointments",
        data,
      });
    } catch (e) {
      return res.status(500).send({
        error: true,
        msg: "Internal Server Error",
      });
    }
  }

  async getAppointmentDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { query } = req;
      let data = await Appointment.findOne({ _id: query._id });
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

  async getAppointmentsClientList(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { query } = req;
      const filter: any = {
        attorney: req.user._id,
        "payment.status": "paid",
      };

      if (!!query.search) {
        filter["name"] = {
          $regex: new RegExp(query.search.toLowerCase(), "i"),
        };
      }

      console.log("Filter applied:", filter);

      const data = await Appointment.paginate(filter, {
        page: query.page || 1,
        limit: query.limit || 10,
        sort: { createdAt: -1 },
        select: "-__v",
        populate: [
          {
            path: "user",
            select:
              "name email image phone_no dob pre_address per_address postal_code country image  ",
          },
        ],
      });

      return res.status(200).send({
        error: false,
        msg: "Successfully gets Appointments",
        data,
      });
    } catch (e) {
      console.error("Error:", e); // Debugging the error
      return res.status(500).send({
        error: true,
        msg: "Internal Server Error",
      });
    }
  }

  async getAppinmentClientDetails(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { query } = req;
      const filter = { _id: query._id };

      console.log("Filter applied:", filter);

      const data = await Appointment.findOne(filter).populate({
        path: "user",
        select:
          "name email image phone_no dob pre_address per_address postal_code country",
      });

      if (!data) {
        return res.status(400).send({
          error: true,
          msg: "Appointment not found",
        });
      }

      return res.status(200).send({
        error: false,
        msg: "Successfully retrieved appointment details",
        data,
      });
    } catch (e) {
      console.error("Error:", e);
      return res.status(500).send({
        error: true,
        msg: "Internal Server Error",
      });
    }
  }

  async caseStatusUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      const { _id, status } = req.body;
      if (!_id || !status) {
        return ApiResponse.error(res, "Missing required fields", 400);
      }
      const appointment = await Appointment.findById({ _id: _id });
      if (!appointment) {
        return ApiResponse.error(res, "Appointment not found", 404);
      }
      appointment.status = status;
      await appointment.save();
      return ApiResponse.success(res, "Case status updated successfully");
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  // my cases list
  async getMyCasesList(req: Request, res: Response, next: NextFunction) {
    try {
      const { query } = req;
      const filter = { attorney: req.user._id, status: "completed" };
      if (!!query.search) {
        filter[`name`] = {
          $regex: new RegExp(query.search.toLowerCase(), "i"),
        };
      }

      let data = await Appointment.paginate(filter, {
        page: query.page || 1,
        limit: query.limit || 10,
        sort: { createdAt: -1 },
        select: "-__v",
        populate: [
          {
            path: "user",
            select: "name email image",
          },
        ],
      });

      return res.status(200).send({
        error: false,
        msg: "Successfully retrieved confirmed cases",
        data,
      });
    } catch (e) {
      return res.status(500).send({
        error: true,
        msg: "Internal Server Error",
      });
    }
  }

  async getMyCasesDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { query } = req;
      let data = await Appointment.findOne({ _id: query._id });
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

  // Availability Management
  async updateAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const { availability } = req.body;

      if (!Array.isArray(availability)) {
        return ApiResponse.error(res, "Availability must be an array", 400);
      }

      const attorney = await User.findOneAndUpdate(
        { _id: req.user._id, role: "attorney" },
        { $set: { availability: availability } },
        { new: true }
      ).select("-password");

      if (!attorney) {
        return ApiResponse.error(res, "Attorney not found", 404);
      }

      return ApiResponse.success(res, "Availability updated successfully", {
        availability: attorney.availability,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const attorneys = await User.find(
        { role: "attorney" },
        "name email availability"
      );

      if (!attorneys || attorneys.length === 0) {
        return res
          .status(404)
          .json({ error: true, msg: "No attorneys found with availability." });
      }

      return res.status(200).json({
        error: false,
        msg: "Availability list retrieved successfully",
        data: attorneys,
      });
    } catch (error) {
      next(error);
    }
  }
  async getAppointmentHearing(req: Request, res: Response, next: NextFunction) {
      try {
        const { query } = req;
        const user = req.user;
        let data = await Appointment.findOne({
          attorney: user._id,
          status: "confirmed",
          select_date:{
            $gte: new Date(),
          }
        }).populate({path:"user" ,select:"name email image"})
            .populate({path:"attorney" ,select:"name email image"}).lean()
        const time = new moment(`${new Date(data.select_date).toISOString().split("T")[0]} ${data.slot_time}`).toISOString();
        if (!data) {
          return res.status(400).send({
            error: true,
            msg: "Appointment not found",
          });
        }
        return res.status(200).send({
          error: false,
          msg: "Successfully get  upcoming Hearing ",
          data : {
            ...data,
            time,
          },
        });
      } catch (e) {
        return res.status(500).send({
          error: true,
          msg: "Internal Server Error",
        });
      }
    }
  async getBookingSlot(req: Request, res: Response, next: NextFunction) {
      try {
        const { query } = req;
        const user = req.user;
        let data = await Appointment.aggregate([{
          $match:{
            attorney: user._id,
            status: "confirmed",
          }
           
        },{
           $group:{
              _id:"$select_date",
              slot_time:{
                $addToSet:"$slot_time"
              }
           }
        },
        {
          $project:{
            _id:0,
            select_date:"$_id",
            slot_time:1
          }
        }

      ])
      
        if (!data) {
          return res.status(400).send({
            error: true,
            msg: "Appointment not found",
          });
        }
        return res.status(200).send({
          error: false,
          msg: "Successfully get Appointment ",
          data ,
        });
      } catch (e) {
        console.log(e);
        return res.status(500).send({
          error: true,
          msg: "Internal Server Error",
        });
      }
    }
}
