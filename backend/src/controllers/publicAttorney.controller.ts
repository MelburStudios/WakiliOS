//@ts-nocheck
 import { ApiResponse } from "../utils/response.util";
import { User } from "../models/user.model";

 export const  getAttorneys = async (req: Request, res: Response, next: NextFunction) => {
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

  export const getAttorney = async(req: Request, res: Response, next: NextFunction) => {
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