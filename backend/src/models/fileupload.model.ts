import { ref } from "joi";
import { aggregatePaginate, paginate } from "../utils/mongoose";
import mongoose, { Schema } from "mongoose";

const FileUploadSchema = new Schema({
    user:{
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
    attorneyId:{
        type: Schema.Types.ObjectId,
        ref: 'user',
      },
    file_name: {
        type: String,
        required: true,

    },
    file: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})
FileUploadSchema.plugin(paginate);
FileUploadSchema.plugin(aggregatePaginate);
const fileUploads = mongoose.model('fileUploads', FileUploadSchema);
export default fileUploads