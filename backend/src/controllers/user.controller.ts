//@ts-nocheck
import { Request, Response, NextFunction } from "express";
import { User } from "../models/user.model";
import { Case } from "../models/case.model";
import { Appointment } from "../models/appointment.model";
import { AppError } from "../middleware/errorHandler";
import Stripe from "stripe";
import { config } from "../config/config";
import { ApiResponse } from "../utils/response.util";
import { RequestWithFile } from "../types/multer.types";
import PaymentMethod from "../models/paymentMethod.model";
import { generateUid } from "../utils/helper";
import paypal from "paypal-rest-sdk";
import { s3DeleteFiles } from "../utils/s3";
import Filter from "../models/filter.model";
import fileUploads from "../models/fileupload.model";
import { populate } from "dotenv";
import path from "path";
import Razorpay from "razorpay";
const stripe = new Stripe(config.stripe.secretKey!, {
  apiVersion: "2023-10-16",
});
import moment from "moment";
import { createEvent } from "./../utils/event";
import Message from "../models/message/message.model";
import { mergeDateAndTime } from "./../utils/date";
import mongoose from "mongoose";

interface BookAppointmentRequest extends RequestWithFile {
  body: {
    attorneyId: string;
    select_date: string;
    slot_time: string;
    case_type: string;
    short_description: string;
    case_history?: string;
    evidence?: string[];
  };
}

export class UserController {
  // Profile Management
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        return next(new AppError("User not authenticated", 401));
      }

      const user = await User.findById(req.user.id).select("-password");
      if (!user) {
        return next(new AppError("User not found", 404));
      }

      return res.status(200).json({ user });
    } catch (error) {
      return next(error);
    }
  }

  async updateProfile(req: RequestWithFile, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        return next(new AppError("User not authenticated", 401));
      }

      // Extract allowed fields to update
      const allowedFields = [
        "name",
        "email",
        "phone_no",
        "dob",
        "pre_address",
        "per_address",
        "postal_code",
        "country",
        "image",
      ];
      const updateData = Object.keys(req.body)
        .filter((key) => {
          // Map the incoming field names to model field names
          const mappedKey =
            key === "fullName"
              ? "name"
              : key === "phoneNo"
                ? "phone_no"
                : key === "preAddress"
                  ? "pre_address"
                  : key === "perAddress"
                    ? "per_address"
                    : key === "postalCode"
                      ? "postal_code"
                      : key;
          return allowedFields.includes(mappedKey);
        })
        .reduce((obj: any, key) => {
          // Use the mapped keys when setting the values
          const mappedKey =
            key === "fullName"
              ? "name"
              : key === "phoneNo"
                ? "phone_no"
                : key === "preAddress"
                  ? "pre_address"
                  : key === "perAddress"
                    ? "per_address"
                    : key === "postalCode"
                      ? "postal_code"
                      : key;
          obj[mappedKey] = req.body[key];
          return obj;
        }, {});

      // Add image if it was uploaded
      if (req.file?.location) {
        updateData.image = req.file.location;
      }

      const user = await User.findByIdAndUpdate(req.user.id, updateData, {
        new: true,
        runValidators: true,
        context: "query",
      }).select("-password");

      if (!user) {
        return next(new AppError("User not found", 404));
      }

      return ApiResponse.success(res, "Profile updated successfully", { user });
    } catch (error: any) {
      if (error.name === "ValidationError") {
        return next(new AppError(error.message, 400));
      }
      if (error.code === 11000) {
        // Duplicate key error
        return next(new AppError("Email already exists", 400));
      }
      return next(error);
    }
  }

  // Dashboard Statistics
  async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      const appointment = await Appointment.aggregate([
        {
            $match:{
                user:user._id
            }
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      const message = await Message.find({ to: user._id })
        .sort({ createdAt: -1 })
        .populate({ path: "to", select: "name image role" })
        .populate({ path: "from", select: "name image role" })
        .lean();
      console.log(message);

      return ApiResponse.success(
        res,
        "Dashboard statistics retrieved successfully",
        {
          data: {
            appointment,
            message: message[0] ? message[0] : null,
          },
        }
      );
    } catch (error) {
      next(error);
    }
  }

  // Attorney Listing
  async getAttorneys(req: Request, res: Response, next: NextFunction) {
    try {
      const attorneys = await User.find({ role: "attorney", status: "active" })
        .select("-password")
        .sort("-createdAt");

      return ApiResponse.success(res, "Attorneys retrieved successfully", {
        attorneys,
      });
    } catch (error) {
      next(error);
    }
  }

  // Appointment Management
  async bookAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        return ApiResponse.error(res, "User not authenticated", 401);
      }
      const {
        attorneyId,
        select_date,
        slot_time,
        case_type,
        short_description,
        case_history,
        evidence,
        method,
        currency,
      } = req.body;

      let attorney = await User.findById({ _id: attorneyId });
      if (!attorney) {
        return ApiResponse.error(res, "Attorney not found", 404);
      }
      let atonrnyPrice = attorney.price;
      if (method === "stripe") {
        try {
          let stripeConfig = await PaymentMethod.findOne({ type: "stripe" });
          if (!stripeConfig) {
            return ApiResponse.error(
              res,
              "Stripe configuration not found for this user",
              400
            );
          }
          const stripeClient = new Stripe(stripeConfig?.config?.clientSecret);
          const amountInCents = Math.round(parseFloat(atonrnyPrice) * 100);
          const successUrl = `${config.frontendUrl}/appointment/stripe/success?session_id={CHECKOUT_SESSION_ID}`;
          const cancelUrl = `${config.frontendUrl}/appointment/failed`;

          const session = await stripeClient.checkout.sessions.create({
            line_items: [
              {
                price_data: {
                  currency: currency,
                  product_data: { name: "Appointment" },
                  unit_amount: amountInCents,
                },
                quantity: 1,
              },
            ],
            mode: "payment",
            success_url: successUrl,
            cancel_url: cancelUrl,
          });

          // Create the appointment
          const appointment = await Appointment.create({
            user: req.user.id,
            attorney: attorneyId,
            select_date: await mergeDateAndTime(select_date, slot_time), // new Date(`${new Date(select_date).toISOString().split("T")[0]} ${slot_time}`).toISOString(),
            slot_time,
            case_type,
            short_description,
            case_history,
            evidence,
            payment: {
              method: "stripe",
              status: "pending",
              transaction_id: session.id,
              amount: attorney.price,
            },
          });
          return res.status(200).send({
            error: false,
            msg: "Payment created successfully",
            data: session.url,
          });
        } catch (error) {
          console.log(error);
          return ApiResponse.error(res, error.message, 400);
        }
      }
      if (method === "paypal") {
        try {
          let paypalConfig = await PaymentMethod.findOne({ type: "paypal" });

          if (!paypalConfig) {
            return res.status(400).send({
              error: true,
              msg: "Paypal configuration not found for this user",
            });
          }

          let paypalCreds = {
            mode: paypalConfig.config.mode,
            client_id: paypalConfig.config.clientId,
            client_secret: paypalConfig.config.clientSecret,
          };

          paypal.configure(paypalCreds);

          const subsPrice = parseFloat(atonrnyPrice).toFixed(2);
          const currencyCode = (currency || "USD").toUpperCase();

          const create_payment_json = {
            intent: "sale",
            payer: {
              payment_method: "paypal",
            },
            redirect_urls: {
              return_url: `${config.frontendUrl}/appointment/paypal/success`,
              cancel_url: `${config.frontendUrl}/appointment/failed`,
            },
            transactions: [
              {
                item_list: {
                  items: [
                    {
                      name: "Appointment",
                      sku: attorney._id.toString(),
                      price: subsPrice.toString(),
                      currency: currencyCode || "USD",
                      quantity: 1,
                    },
                  ],
                },
                amount: {
                  currency: currencyCode,
                  total: subsPrice.toString(),
                },
                description: "Appointment with attorney",
              },
            ],
          };

          paypal.payment.create(
            create_payment_json,
            async function (error, payment) {
              if (error) {
                return res.status(500).send({
                  error: true,
                  msg: "Invalid Currency or Payment issue",
                });
              } else {
                const appointment = await Appointment.create({
                  user: req.user.id,
                  attorney: attorneyId,
                  select_date,
                  slot_time,
                  case_type,
                  short_description,
                  case_history,
                  evidence,
                  payment: {
                    method: "paypal",
                    status: "pending",
                    transaction_id: payment.id,
                    amount: subsPrice,
                  },
                });

                for (let i = 0; i < payment.links.length; i++) {
                  if (payment.links[i].rel === "approval_url") {
                    return res.status(200).send({
                      error: false,
                      msg: "Payment created successfully",
                      data: payment.links[i].href,
                    });
                  }
                }
              }
            }
          );
        } catch (error) {
          return ApiResponse.error(res, error.message, 400);
        }
      }
    } catch (error) {
      console.error("Appointment booking error:", error);
      return ApiResponse.error(
        res,
        error.message || "Failed to book appointment",
        400
      );
    }
  }

  // paypal payment success
  async paypalPaymentSuccess(req: Request, res: Response, next: NextFunction) {
    try {
      const { query } = req;
      const { paymentId, PayerID } = query;

      let subscription = await Appointment.findOne({
        "payment.transaction_id": paymentId,
      })
        .populate({ path: "user", select: "email" })
        .populate({ path: "attorney", select: "email" });

      if (!subscription) {
        return res.status(404).json({
          message: "Invalid payment ID",
        });
      }

      if (subscription.payment.status === "paid") {
        return res.status(400).send({
          error: true,
          msg: "Payment already processed",
        });
      }

      let paypalConfig = await PaymentMethod.findOne({ type: "paypal" });
      if (!paypalConfig) {
        return res.status(400).send({
          error: true,
          msg: `PayPal configuration not found`,
        });
      }

      paypal.configure({
        mode: paypalConfig.config.mode,
        client_id: paypalConfig.config.clientId,
        client_secret: paypalConfig.config.clientSecret,
      });

      const execute_payment_json = {
        payer_id: PayerID,
        transactions: [
          {
            amount: {
              currency: "USD",
              total: subscription.payment.amount.toString(),
            },
          },
        ],
      };
      paypal.payment.execute(
        paymentId,
        execute_payment_json,
        async function (error, payment) {
          if (error) {
            return res.status(500).send({
              error: true,
              msg: error.response,
            });
          } else {
            await Appointment.updateMany(
              { user: subscription.user, active: true },
              { $set: { active: false } }
            );

            const time = await mergeDateAndTime(
              subscription.select_date,
              subscription.slot_time
            );
            const meet = await createEvent(
              [
                {
                  email: "admin@jisrcareapp.com",
                  email: subscription.user.email,
                  email: subscription.attorney.email,
                },
              ],
              moment(time)
            );
            // console.log(meet);
            subscription.status = "confirmed";
            subscription.payment.status = "paid";
            subscription.payment.method = "paypal";
            subscription.meetLink = meet.hangoutLink;
            await subscription.save();

            return res.status(200).send({
              error: false,
              msg: "Payment processed successfully",
              data: subscription,
            });
          }
        }
      );
    } catch (error) {
      res.status(500).send({
        error: true,
        msg: error.message,
      });
    }
  }

  async AppointmentCount(req: Request, res: Response, next: NextFunction) {
    try {
      const appointment = await Appointment.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      return res.status(200).send({
        success: true,
        msg: "Appointment paid successfully",
        appointment,
      });
    } catch (error) {
      next(error);
    }
  }

  async stripePaymentSuccess(req: Request, res: Response, next: NextFunction) {
    try {
      const { session_id } = req.query;
      if (!session_id) {
        return res.status(400).send({
          error: true,
          msg: "Session ID is required",
        });
      }
      const stripeConfig = await PaymentMethod.findOne({ type: "stripe" });
      if (!stripeConfig) {
        return res.status(400).send({
          error: true,
          msg: "Stripe configuration not found for this user",
        });
      }
      const stripeClient = new Stripe(stripeConfig?.config?.clientSecret);
      const session = await stripeClient.checkout.sessions.retrieve(
        session_id as string
      );
      if (session.payment_status === "paid") {
        const appointment = await Appointment.findOne({
          "payment.transaction_id": session_id,
        })
          .populate({ path: "user", select: "email" })
          .populate({ path: "attorney", select: "email" });

        if (!appointment) {
          return res.status(404).send({
            error: true,
            msg: "Appointment not found",
          });
        }

        appointment.payment.status = "paid";

        const time = await mergeDateAndTime(
          appointment.select_date,
          appointment.slot_time
        );

        const meet = await createEvent(
          [
            {
              email: "admin@jisrcareapp.com",
              email: appointment.user.email,
              email: appointment.attorney.email,
            },
          ],
          moment(time)
        );
        appointment.status = "confirmed";
        appointment.meetLink = meet.hangoutLink;
        await appointment.save();
        return res.status(200).send({
          success: true,
          msg: "Appointment paid successfully",
          appointment: {
            ...appointment._doc,
            time: moment(appointment.createdAt).subtract(time),
          },
        });
      } else {
        return res.status(400).send({
          error: true,
          msg: "Payment not completed",
        });
      }
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  async getAppointmentHearing(req: Request, res: Response, next: NextFunction) {
    try {
      const { query } = req;
      const user = req.user;
      let data = await Appointment.findOne({
        user: user._id,
        status: "confirmed",
        select_date: {
          $gte: new Date(),
        },
      })
        .populate({ path: "user", select: "name email image" })
        .populate({ path: "attorney", select: "name email image" })
        .lean();
      const time = new moment(
        `${new Date(data.select_date).toISOString().split("T")[0]} ${data.slot_time}`
      ).toISOString();
      if (!data) {
        return res.status(400).send({
          error: true,
          msg: "Appointment not found",
        });
      }
      return res.status(200).send({
        error: false,
        msg: "Successfully get  upcoming Hearing ",
        data: {
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
  async getMyCases(req: Request, res: Response, next: NextFunction) {
    try {
      const cases = await Case.find({ client: req.user.id })
        .populate("attorney", "name email")
        .sort("-createdAt");

      return ApiResponse.success(res, "Cases retrieved successfully", {
        cases,
      });
    } catch (error) {
      next(error);
    }
  }
  // get appintment  list
  async getAppointments(req: Request, res: Response, next: NextFunction) {
    try {
      const { query } = req;
      const { _id } = req.user;
      const filter = {
        user: _id,
        status: { $in: ["confirmed", "completed"] },
      };
      const langCode = query.langCode || "en";

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
            path: "attorney",
            select: "name email image",
          },
          {
            path: "user",
            select: "name email image",
          },
        ],
      });
      return res.status(200).send({
        error: false,
        msg: "Successfully gets appointment list",
        data,
      });
    } catch (e) {
      return res.status(500).send({
        error: true,
        msg: "Internal Server Error",
      });
    }
  }
  // get appintment detail
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

  async getAppointmentAttorneyList(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { query } = req;
      const { _id } = req.user;
      const filter = {
        user: _id,
      };

      let data = await Appointment.paginate(filter, {
        page: query.page || 1,
        limit: query.limit || 10,
        sort: { createdAt: -1 },
        populate: {
          path: "attorney",
          select: "name email",
        },
        select: "-__v",
      });

      const attorneyList = data.docs
        .flatMap((appointment) => appointment.attorney)
        .reduce((uniqueAttorneys, attorney) => {
          if (
            !uniqueAttorneys.some(
              (a) => a._id.toString() === attorney._id.toString()
            )
          ) {
            uniqueAttorneys.push(attorney);
          }
          return uniqueAttorneys;
        }, []);

      return res.status(200).send({
        error: false,
        msg: "Successfully got unique appointment attorney list",
        data: attorneyList,
      });
    } catch (e) {
      return res.status(500).send({
        error: true,
        msg: "Internal Server Error",
      });
    }
  }

  async postPdf(req: Request, res: Response, next: NextFunction) {
    try {
      const { attorneyId, file_name, file } = req.body;
      const user = req.user;
      if (!attorneyId || !file_name || !file) {
        return res.status(400).send({
          error: true,
          msg: "Missing required fields",
        });
      }
      const appintment = await Appointment.findOne({
        attorney: attorneyId,
        user: user._id,
        status: "confirmed",
      });
      if (!appintment) {
        return res.status(400).send({
          error: true,
          msg: "Appointment can not exist with this attorney . please schedule appointment",
        });
      } else {
        await Appointment.findOneAndUpdate(
          {
            _id: appintment._id,
          },
          {
            evidence: Array.from(new Set([...appintment.evidence, file])),
          }
        );
      }
      const newPdf = await fileUploads.create({
        attorneyId,
        user: user._id,
        file_name,
        file,
      });
      if (!newPdf) {
        return res.status(400).send({
          error: true,
          msg: "Failed to upload file",
        });
      }

      return res.status(200).send({
        error: false,
        msg: "File uploaded successfully",
        data: newPdf,
      });
    } catch (e) {
      console.log(e);
      return res.status(500).send({
        error: true,
        msg: "Internal Server Error",
      });
    }
  }
  async getPdfList(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      const { query } = req;
      const filter = {
        user: new mongoose.Types.ObjectId(user._id)
      };

      if (!!query.search) {
        filter[`file_name`] = {
          $regex: new RegExp(query.search.toLowerCase(), "i"),
        };
      }
      let data = await fileUploads.paginate(filter, {
        page: query.page || 1,
        limit: query.limit || 10,
        sort: { createdAt: -1 },
        populate:{path:"attorneyId" ,select:"name email"},
        select: "-__v",
      })
      return res.status(200).send({
        error: false,
        msg: "Successfully gets pdf list",
        data,
      });
    } catch (e) {
      console.log(e);
      return res.status(500).send({
        error: true,
        msg: "Internal Server Error",
      });
    }
  }
  async getPdfDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { query } = req;
      let data = await fileUploads.findOne({ _id: query._id });
      if (!data) {
        return res.status(400).send({
          error: true,
          msg: "Pdf not found",
        });
      }
      return res.status(200).send({
        error: false,
        msg: "Successfully get pdf details",
        data,
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
          user: user._id,
          status: "confirmed",
        }
         
      },{
         $group:{
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",   
              date: "$select_date"
            }
          },
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
        data :data,
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
