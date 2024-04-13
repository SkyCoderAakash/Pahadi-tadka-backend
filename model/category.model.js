import mongoose from 'mongoose';

const categorySchema = mongoose.Schema({
    categoryName : {
        type : String,
        required :true,
    },
    categoryTitle : {
        type : String,
        required :true,
    },
    categoryDescription : {
        type : String,
        required :true,
    },
    imageURL : {
        type : String,
        required : true,
    },
    imagePublicId : {
        type : String,
        required : true,
    },
    originalName :  {
        type : String,
        required : true
    }
},{timestamps : true});

const categoryModel = mongoose.model('Category',categorySchema);
export default categoryModel;