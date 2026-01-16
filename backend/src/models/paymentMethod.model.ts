import { paginate } from "../utils/mongoose";
import { model, Schema } from "mongoose";

const paymentMethodSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        required: true,
        enum: ['paypal', 'stripe', "razorpay", "mollie"],
        default: 'stripe'
    },
    
    config: {
        clientId: String,
        clientSecret: String,
        mode: {
            type: String,
            enum: ['sandbox', 'live'],
            default: 'sandbox'
        },
        is_live: Boolean,
    },
    image:String
    
}, { timestamps: true })

paymentMethodSchema.plugin(paginate)
const PaymentMethod = model('payment_method', paymentMethodSchema);

export default PaymentMethod;
