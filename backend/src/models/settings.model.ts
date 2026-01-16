import {model, Schema} from "mongoose";

const schema = new Schema({
    logo: String,
    title: String,
    description: String,
    email: String,
    phone: String,
    address: String,
    copyright: String,
    facebook: String,
    twitter: String,
    instagram: String,
    whatsapp: String,
    youtube: String,
    banner_image: String,
    favicon: String,
    loader_image: String,
  },
  {
    timestamps: true,
  }
)
const Settings = model('settings', schema);
export default Settings;

