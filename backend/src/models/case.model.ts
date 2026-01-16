//@ts-nocheck
import { aggregatePaginate, paginate } from "../utils/mongoose";
import { Schema, model, Document } from "mongoose";

export interface ICase extends Document {
  image: string;
  thumbnail: string;
  title: string;
  short_description: string;
  description: string;
  feature: boolean;
  solve: {
    title: string;
    description: string;
  };
  challenges: {
    title: string;
    description: string;
  };
  solved: {
    title: string;
    description: string;
  };
  solved_result: {
    title: string;
    description: string;
  };
  attorney: Schema.Types.ObjectId;
  client: Schema.Types.ObjectId;
  status: "pending" | "active" | "completed";
  next_hearing?: {
    title: string;
    description: string;
    date: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const caseSchema = new Schema(
  {
    image: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    title: {
      type: Schema.Types.Map,
      of: String,
      required: true,
    },
    short_description: {
      type: Schema.Types.Map,
      of: String,
      required: true,
    },
    description: {
      type: Schema.Types.Map,
      of: String,
      required: true,
    },
    feature: {
      type: Schema.Types.Map,    
      of: String,
      required: true,
    },
    solve: {
      title: {
        type: Schema.Types.Map,
        of: String,
        required: true,
      },
      description: {
        type: Schema.Types.Map,
        of: String,
        required: true,
      },
    },
    challenges: {
      title: {
        type: Schema.Types.Map,
        of: String,
        required: true,
      },
      description: {
        type: Schema.Types.Map,
        of: String,
        required: true,
      },
    },
    solved: {
      title: {
        type: Schema.Types.Map,
        of: String,
        required: true,
      },
      description: {
        type: Schema.Types.Map,
        of: String,
        required: true,
      },
    },
    solved_result: {
      title: {
        type: Schema.Types.Map,
        of: String,
        required: true,
      },
      description: {
        type: Schema.Types.Map,
        of: String,
        required: true,
      },
    },
    attorney: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["pending", "active", "completed"],
      default: "pending",
    },
    next_hearing: {
      title: {
        type: Schema.Types.Map,
        of: String,
      },
      description: {
        type: Schema.Types.Map,
        of: String,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: true,
  }
);

caseSchema.plugin(paginate);
caseSchema.plugin(aggregatePaginate);
export const Case = model<ICase>("Case", caseSchema);
