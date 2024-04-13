import mongoose from 'mongoose';

const couponSchema = mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true // Ensures each coupon code is unique
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'], // Specifies the type of discount (percentage or fixed amount)
        required: true
    },
    discountAmount: {
        type: Number,
        required: true,
        min: 0 // Minimum discount amount allowed
    },
    validFrom: {
        type: Date,
        required: true
    },
    validUntil: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
},{timestamps : true});

const couponModel = mongoose.model('Coupon',couponSchema);
export default couponModel;