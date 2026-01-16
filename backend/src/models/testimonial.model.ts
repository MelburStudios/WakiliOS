//@ts-nocheck
import { model, Schema } from "mongoose";
import { aggregatePaginate, paginate } from "../utils/mongoose";

let schema = new Schema({
    image: String,
    name: String,
    email: String,
    active:{
        type: Boolean,
        default: false
    },
    rating: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    
}, { timestamps: true })

schema.plugin(paginate)
schema.plugin(aggregatePaginate)

const Testimonial = model('testimonial', schema);

export default Testimonial