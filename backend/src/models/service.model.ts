import { aggregatePaginate, paginate } from "../utils/mongoose";
import { Schema, model, Document } from "mongoose";

export interface IService extends Document {
  name: string;
  description: string;
  icon: string;
  image: string;
  feature: boolean;
  other_description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    name: {
      type: Schema.Types.Map,
      of: String,
      required: [true, "Name is required"],
    },
    description: {
      type: Schema.Types.Map,
      of: String,
      required: [true, "Description is required"],
    },
    icon: {
      type: String,
      required: [true, "Icon is required"],
    },
    image: {
      type: String,
      required: [true, "Image is required"],
    },
    feature: [
      {
        name: {
          type: Schema.Types.Map,
          of: String,
          required: true,
        },
        description: {
          type: Schema.Types.Map,
          of: String,
          required: true,
        },
        file: { type: String },
      },
    ],
    other_description: {
      type: Schema.Types.Map,
      of: String,
    },
  },
  {
    timestamps: true,
  }
);

serviceSchema.plugin(paginate);
serviceSchema.plugin(aggregatePaginate);

export const Service = model<IService>("Service", serviceSchema);
