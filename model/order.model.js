import mongoose from 'mongoose';

const orderSchema = mongoose.Schema({
    shippingAddress : {
        address : {type : String, required : true},
        city : {type : String, required : true},
        state : {type : String, required : true},
        landmark : {type : String, required : true},
        pinCode : {type : Number, required : true},
    },
    orderItems: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            productName : {
                type : String,
                required : true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1 // Minimum quantity allowed is 1
            },
            price: {
                type: Number,
                required: true,
                min: 0 // Minimum price allowed is 0
            },
            imageUrl : {
                type : String,
                required : true
            },

        }
    ],
    phoneNumber : {
        type : String,
        required : true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    paidAt : {
        type : Date,
        required : true
    },
    paymentDetail : {
        id : {
            required : true,
            type : String
        },
        status : {
            required : true,
            type : String,
        }
    },
    shippingCharges : {
        required : true,
        type : Number,
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    orderStatus: {
        type: String,
        enum: ['pending', 'processing', "shipped" , 'delivered'],
        default: 'pending'
    },
    deliveredAt : {
        type : Date,
    },
    createdAt : {
        type : Date,
        default : Date.now()
    }
},{timestamps : true});

const orderModel = mongoose.model('Order',orderSchema);
export default orderModel;