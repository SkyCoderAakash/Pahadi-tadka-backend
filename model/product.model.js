import mongoose from "mongoose";

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      require: true,
    },
    stock: {
      type: Number,
      require: true,
    },
    isPromoted: {
      type: Boolean,
      defaualt: false,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numberOfRatings : {
      type: Number,
      default: 0,
    },
    cookingTime: {
      type: Number,
      require: true,
    },
    categoryName: {
      type: String,
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    imageURL: {
      type: String,
      required: true,
    },
    imagePublicId: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const productModel = mongoose.model("Product", productSchema);
export default productModel;
