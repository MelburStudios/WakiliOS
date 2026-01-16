//@ts-nocheck
import { ApiResponse } from "../../utils/response.util";
import { Case } from "../../models/case.model";
import exp from "constants";
import { title } from "process";
import { s3DeleteFiles } from "../../utils/s3";

import mongoose from "mongoose";
import { Request, Response, NextFunction } from "express";
import { Case } from "../models/Case";
import { ApiResponse } from "../utils/ApiResponse";

export const createCase = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let { query, body } = req; 
    const user = res.locals.user?.id;

    if (!user) {
      return res.status(400).send({
        error: true,
        msg: "User not found",
      });
    }

    if (body._id) {
      if (!mongoose.Types.ObjectId.isValid(body._id)) {
        return ApiResponse.error(res, "Invalid case ID");
      }

      let data = await Case.findById(body._id);
      if (!data) {
        return ApiResponse.error(res, "Case not found!");
      }

      let updatedData = await Case.findOneAndUpdate(
        { _id: body._id },
        body,
        { new: true }
      );

      return res.status(200).send({
        error: false,
        msg: "Case has been updated successfully",
        data,
      });
    }

    const data = await Case.create({
      title: body.title,
      short_description: body.short_description,
      description: body.description,
      feature: body.feature,
      solve: body.solve,
      challenges: body.challenges,
      solved: body.solved,
      solved_result: body.solved_result,
      next_hearing: body.next_hearing,
      image: body.image,
      thumbnail: body.thumbnail,
      user: user,
    });

    return res.status(200).send({
      error: false,
      msg: "Case has been created successfully",
      data,
    });
  } catch (e) {
    console.error("Error creating/updating case:", e);
    return ApiResponse.error(res, "Internal Server Error", 500);
  }
};


export const getCases = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { query } = req;
    const filter = {};
    const langCode = query.langCode || "en";

    if (!!query.search) {
      filter[`title.${langCode}`] = {
        $regex: new RegExp(query.search.toLowerCase(), "i"),
      };
    }
    let data = await Case.paginate(filter, {
      page: query.page || 1,
      limit: query.limit || 10,
      sort: { createdAt: -1 },
    });
    return res.status(200).send({
      error: false,
      msg: "Successfully gets Cases",
      data,
    });
  } catch (e) {
    return ApiResponse.error(res, "Internal Server Error", 500);
  }
};

export const getCaseDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { query } = req;
    let data = await Case.findOne({ _id: query._id });

    if (!data) {
      return ApiResponse.error(res, "Case not found", 404);
    }
    return res.status(200).send({
      error: false,
      msg: "Successfully gets Case",
      data,
    });
  } catch (e) {
    return ApiResponse.error(res, "Internal Server Error", 500);
  }
};

export const deleteCase = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { query } = req;
    let data = await Case.findById({ _id: query._id });
    if (!data) {
      return res.status(400).send({
        error: true,
        msg: "Case not found",
      });
    }
    await Case.findOneAndDelete({ _id: query._id });
    if (!!data?.image || !!data?.thumbnail) {
      await s3DeleteFiles([data?.image, data?.thumbnail]);
    }
    return res.status(200).send({
      error: false,
      msg: "Case deleted successfully",
    });
  } catch (e) {
    return ApiResponse.error(res, "Internal Server Error", 500);
  }
};
