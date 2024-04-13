import cartModel from "../model/cart.model.js";
import userModel from "../model/user.model.js";

import CartModel from "../model/cart.model.js"; // Import your cart model
import UserModel from "../model/user.model.js"; // Import your user model

// Controller function to create a cart
const createCart = async (req, res) => {
    try {
        // Ensure the request is coming from an authenticated user
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized access" });
        }

        // Retrieve user information
        const userId = req.user._id; // Assuming you have userId stored in req.user after authentication

        // Retrieve product details from request body
        const { productId, productName, quantity, price } = req.body;

        // Validate productId, productName, quantity, and price

        // Create cart object
        const cartItem = {
            productId,
            productName,
            quantity,
            price
        };

        // Find the user's cart or create a new one if it doesn't exist
        let cart = await CartModel.findOne({ userId });

        if (!cart) {
            cart = new CartModel({
                userId,
                product: [cartItem]
            });
        } else {
            // Check if the product already exists in the cart
            const existingProductIndex = cart.product.findIndex(item => item.productId.toString() === productId);

            if (existingProductIndex !== -1) {
                // If product already exists, update its quantity and price
                cart.product[existingProductIndex].quantity += quantity;
                cart.product[existingProductIndex].price = price; // You may want to adjust the price calculation logic based on your requirement
            } else {
                // If product doesn't exist, add it to the cart
                cart.product.push(cartItem);
            }
        }

        // Calculate total price
        cart.totalPrice = cart.product.reduce((acc, item) => acc + item.quantity * item.price, 0);

        try {
            // Save the cart
            await cart.save();

            // Return success response
            return res.status(201).json({ message: "Product added to cart successfully", cart });
        } catch (error) {
            console.error("Error saving cart:", error);
            // Return error response
            return res.status(500).json({ message: "Failed to save cart" });
        }
    } catch (error) {
        console.error("Error creating cart:", error);
        // Return error response
        return res.status(500).json({ message: "Internal server error" });
    }
};

export { createCart };