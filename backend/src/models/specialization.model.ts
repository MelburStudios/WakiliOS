import { aggregatePaginate, paginate } from "../utils/mongoose";
import { model, Schema } from "mongoose";

let specializationSchema = new Schema({
    name: String
}, { timestamps: true })
specializationSchema.plugin(paginate)
specializationSchema.plugin(aggregatePaginate)

const Specialization = model('specialization', specializationSchema);

export default Specialization;