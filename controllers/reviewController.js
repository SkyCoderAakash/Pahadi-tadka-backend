import productModel from "../model/product.model.js";
import reviewModel from "../model/review.model.js";

const createReview = async (req, res) => {
  try {
    const productId = req.params.productId;
    const { rating, comment } = req.body;
    if (!req.user)
      return res
        .status(401)
        .json({
          message: "Login forst then only you can add review to product",
        });
    const { name, _id } = req.user;
    if (!rating || !comment)
      return res.status(400).json({ message: "Fill the data proper" });

    const existingReview = await reviewModel.findOne({
      userId: _id,
      productId: productId,
    });

    let reviewMessage;
    let review;

    if (existingReview) {
      existingReview.rating = Number(rating);
      existingReview.comment = comment;
      await existingReview.save();
      reviewMessage = "Review updated successfully";
      review = existingReview;
    } else {
      // Create new review
      const product = await productModel.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const newReview = new reviewModel({
        userId: _id,
        userName: name,
        productId: productId,
        productName: product.name,
        rating: Number(rating),
        comment,
      });

      await newReview.save();
      reviewMessage = "Review created successfully";
      review = newReview;
    }

    const reviewsOfSingleProduct = await reviewModel.find({
      productId: productId,
    });
    const totalRatings = reviewsOfSingleProduct.reduce(
      (acc, curr) => acc + curr.rating,
      0
    );
    const averageRating = totalRatings / reviewsOfSingleProduct.length;
    const numberOfRatings = reviewsOfSingleProduct.length;

    const addAvgRating = await productModel.findByIdAndUpdate(
      productId,
      { averageRating, numberOfRatings },
      { new: true }
    );
    const finalData = await addAvgRating.save();
    if (addAvgRating)
      return res
        .status(existingReview ? 200 : 201)
        .json({ message: reviewMessage, review: review });
  } catch (error) {
    if (error.name === "CastError")
      return res.status(404).json({ message: "Product not found" });
    console.error("Error creating/updating review:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// only for admin
const getAllReviewsOfSingleProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!productId)
      return res.status(400).json({ message: "Fill the data proper" });
    const product = await productModel.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    const reviews = await reviewModel.find({ productId });
    res
      .status(201)
      .json({ message: "All reviews get successfully", data: reviews });
  } catch (error) {
    if (error.name === "CastError")
      return res.status(404).json({ message: "Product not found" });
    console.error("Error getAllReviewsOfAllProduct review:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// only for admin
const deleteProductReview = async (req, res) => {
    try {
      const { productId } = req.params;
      const { userId } = req.query;
      if (!productId || !userId)
        return res.status(400).json({ message: "Data is not provided properly" });
  
      // Find the review to be deleted
      const reviewToDelete = await reviewModel.findOneAndDelete({
        userId: userId,
        productId: productId,
      });
  
      // If review not found, return 404
      if (!reviewToDelete) {
        return res.status(404).json({ message: "Review not found" });
      }
  
      // Find the product by productId
      const product = await productModel.findById(productId);
  
      // If product not found, return 404
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
  
      // Calculate updated averageRating and numberOfRatings
      const reviewsOfSingleProduct = await reviewModel.find({
        productId: productId,
      });
      const totalRatings = reviewsOfSingleProduct.reduce(
        (acc, curr) => acc + curr.rating,
        0
      );
      const numberOfRatings = reviewsOfSingleProduct.length;
      const averageRating = totalRatings / numberOfRatings;
  
      // Update product with new averageRating and numberOfRatings
      product.averageRating = averageRating;
      product.numberOfRatings = numberOfRatings;
      await product.save();
  
      // Return success response
      return res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
      if (error.name === "CastError") {
        return res.status(404).json({ message: "Product or User not found" });
      }
      console.error("Error deleting product review:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
};
export { createReview, getAllReviewsOfSingleProduct, deleteProductReview };
