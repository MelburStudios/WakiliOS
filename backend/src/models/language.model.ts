// @ts-nocheck
import { paginate } from "./../utils/mongoose";
import { Schema, model, Document } from "mongoose";

export interface ILanguage extends Document {
  name: string;
  code: string;
  active: boolean;
  translations: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

const languageSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    rtl: {
      type: Boolean,
      default: false,
    },
    flag: String,
    translations: Schema.Types.Mixed,
    default: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

languageSchema.plugin(paginate);
export const Language = model<ILanguage>("Language", languageSchema);
