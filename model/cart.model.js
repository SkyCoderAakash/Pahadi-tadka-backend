import mongoose from 'mongoose';

const cartSchema = mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    product : [{
        productId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Product"
        },
        productName : {
            type : String,
            required : true,
        },
        quantity : {
            type : Number,
            required : true
        },
        price : {
            type : Number,
            required : true
        }
    }],
    totalPrice : {
        default : 0,
        type : Number
    },
},{timestamps : true});

const cartModel = mongoose.model('Cart',cartSchema);
export default cartModel;