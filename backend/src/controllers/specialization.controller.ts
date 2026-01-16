//@ts-nocheck

import Specialization from "../models/specialization.model";

// get specialization list
export const getSpecializations = async (req, res) => {
  try {
    const { query } = req;
    const filter = {};
    if (!!query.search) {
      filter[`name`] = {
        $regex: new RegExp(query.search.toLowerCase(), "i"),
      };
    }

    let data = await Specialization.paginate(filter, {
      page: query.page || 1,
      limit: query.limit || 10,
      sort: { createdAt: -1 },
      select: "-__v",
    });
    return res.status(200).send({
      error: false,
      msg: "Successfully gets specializations",
      data,
    });
  } catch (e) {
    return res.status(500).send({
      error: true,
      msg: "Internal Server Error",
    });
  }
};

// get specialization details
export const getSpecialization = async (req, res) => {
  try {
    let { query } = req;
    let data = await Specialization.findById(query._id);
    if (!data) {
      return res.status(400).send({
        error: true,
        msg: "Specialization not found",
      });
    }
    return res.status(200).send({
      error: false,
      msg: "Successfully gets specialization",
      data: data,
    });
  } catch (e) {
    return res.status(500).send({
      error: true,
      msg: "Internal Server Error",
    });
  }
};

// create or update Specialization
export const postSpecialization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let { body } = req;
    const user = res.locals.user?.id;
    if (!user) {
      return res.status(400).send({
        error: true,
        msg: "User not found",
      });
    }

    if (body._id) {
      let data = await Specialization.findById(body._id);
      if (!data) {
        return res.status(400).send({
          error: true,
          msg: "Specialization not found",
        });
      }
      await Specialization.findOneAndUpdate({ _id: body._id }, body);
      return res.status(200).send({
        error: false,
        msg: "Successfully updated Specialization",
      });
    }


    const newData = await Specialization.create({
      name: body.name,
    });

    return res.status(201).send({
      error: false,
      msg: "Successfully created Specialization",
      data: newData,
    });
  } catch (e) {
    return res.status(500).send({
      error: true,
      msg: "Internal Server Error",
    });
  }
};

// delete Specialization
export const delSpecialization = async (req, res) => {
  try {
    let { query } = req;
    const tag = await Specialization.findByIdAndDelete(query._id);

    if (!tag) {
      return res.status(400).send({
        error: true,
        msg: "Specialization not found",
      });
    }

    return res.status(200).send({
      error: false,
      msg: "Specialization has been deleted successfully",
    });
  } catch (e) {
    return res.status(500).send({
      error: true,
      msg: "Internal Server Error",
    });
  }
};
