import mongoose from 'mongoose';

const reviewSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName : {
        type : String,
        required : true,
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    productName : {
        type : String,
        required : true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String
    },
},{timestamps : true});

const reviewModel = mongoose.model('Review',reviewSchema);
export default reviewModel;