
//@ts-nocheck
  import { s3DeleteFiles } from "../../utils/s3";
import { Service } from "../../models/service.model";

  export const createService = async (req: Request, res: Response, next: NextFunction) => {
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
        let data = await Service.findById(body._id);
        if (!data) {
          return res.status(400).send({
            error: true,
            msg: "Service not found",
          });
        }
        await Service.findOneAndUpdate({ _id: body._id }, body);
        return res.status(200).send({
          error: false,
          msg: "Successfully updated Blog",
        });
      }

      if (!body.name || !body.description || !body.image || !body.icon) {
        return res.status(400).send({
          error: true,
          msg: "Missing required fields",
        });
      }

      const newService = await Service.create({
        name: body.name,
        description: body.description,
        image: body.image,
        icon: body.icon,
        feature: body.feature,
        other_description: body.other_description,
        user: user,
      });

      return res.status(201).send({
        error: false,
        msg: "Successfully created Service",
        data: newService,
      });
    } catch (e) {
      console.error("Error in createService:", e);
      return res.status(500).send({
        error: true,
        msg: "Internal Server Error",
      });
    }
  }

 export const getServices = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { query } = req;
      const filter = {};
      const langCode = query.langCode || "en";

      if (!!query.search) {
        filter[`name.${langCode}`] = {
          $regex: new RegExp(query.search.toLowerCase(), "i"),
        };
      }
      let data = await Service.paginate(filter, {
        page: query.page || 1,
        limit: query.limit || 10,
        sort: { createdAt: -1 },
        select: "-__v",
      });
      return res.status(200).send({
        error: false,
        msg: "Successfully gets Services",
        data,
      });
    } catch (e) {
      return res.status(500).send({
        error: true,
        msg: "Internal Server Error",
      });
    }
  }

  export const getServiceDetails = async (req, res) => {
    try {
        const { query } = req
        let data = await Service.findOne({ _id: query._id })
        if (!data) {
            return res.status(400).send({
                error: true,
                msg: 'Service not found'
            })
        }
        return res.status(200).send({
            error: false,
            msg: 'Successfully get service details',
            data: {
                _id: data._id,
                name: data.name,
                description: data.description,
                image: data.image,
                icon: data.icon,
                feature: data.feature,
                other_description: data.other_description,
                createdAt: data.createdAt
            }
        })
    } catch (e) {
        return res.status(500).send({
            error: true,
            msg: "Internal Server Error"
        })
    }
}

 export const delService = async (req, res) => {
    try {
      let { query } = req;
      let data = await Service.findById(query._id);
      if (!data) {
        return res.status(400).send({
          error: true,
          msg: "Service not found",
        });
      }
      await Service.findOneAndDelete({ _id: query._id });
      if (!!data?.image || !!data?.icon) {
        await s3DeleteFiles([data?.image, data?.icon]);
      }
      return res.status(200).send({
        error: false,
        msg: "Successfully deleted service",
      });
    } catch (e) {
      return res.status(500).send({
        error: true,
        msg: "Internal Server Error",
      });
    }
  };