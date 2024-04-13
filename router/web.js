import express from 'express';
const router = express.Router();
import multer from 'multer';
import cloudinary from 'cloudinary';

import { createUser, getAllUser, getUserById, verifyOTP,userByEmail,resetPassword,userLogin, userLogout } from '../controllers/user.controller.js';
import {createCategory, getAllCategory,getCategoryById, updateCategoryById, deleteCategoryById} from '../controllers/category.controller.js'
import { createCoupon, getAllCoupon, getCouponById, updateCouponById, deleteCouponById } from '../controllers/coupon.controller.js';
import { createProduct, getAllProduct, getProductById, updateProductById, deleteProductById } from '../controllers/product.controller.js';

import {isAuthenticatedUser, isAdmin} from '../middleware/auth.js'; 
import { createReview, deleteProductReview, getAllReviewsOfSingleProduct } from '../controllers/reviewController.js';
import {createOrder, getAllOrders, getOrderDetail, myOrder} from '../controllers/order.controller.js';

cloudinary.v2.config({
    cloud_name: 'dxov1dved',
    api_key: '386158841111995',
    api_secret: '6grMt-UtRylltcHbkVNJxMbIX10',
});
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });



// Define routes for user
router.post('/api/user', createUser); // Create a new user
router.post('/api/otpverification/:id', verifyOTP); // verify user main after register
router.post('/api/forgotPassword',userByEmail); // get mail from user and find user in database
router.post('/api/forgotPassword/otpverification/:id',verifyOTP); //take otp from user and match from databse
router.post('/api/login',userLogin), // for user login  
router.get('/api/logout',userLogout); // for user logout
router.put('/api/resetpassword/:id',resetPassword) // after otp verification
router.get('/api/users', getAllUser); // Get a user all user
router.get('/api/user/:id', getUserById); // Get a user a user

// Define routes for cart
// router.post('/api/cart', createCart); // Create a new cart
// router.get('/api/cart/:id', getCart); // Get a cart by ID
// router.put('/api/cart/:id', updateCart); // Update a cart by ID
// router.delete('/api/cart/:id', deleteCart); // Delete a cart by ID

// Define routes for category          {all checked just add a isAdmin middleware}
router.post('/api/category',upload.single('image'),createCategory); // Create a new category
router.get('/api/category',getAllCategory); 
router.get('/api/category/:id', getCategoryById); // Get a category by ID
router.put('/api/category/:id', upload.single('image'), updateCategoryById); // Update a category by ID
router.delete('/api/category/:id', deleteCategoryById); // Delete a category by ID

// Define routes for coupon              {all checked just add a isAdmin middleware}
router.post('/api/coupon', createCoupon);
router.get('/api/coupon', getAllCoupon);
router.get('/api/coupon/:id', getCouponById);
router.put('/api/coupon/:id', updateCouponById);
router.delete('/api/coupon/:id', deleteCouponById);

// Define routes for order
router.post('/api/order',isAuthenticatedUser, createOrder);  // user can create order
router.get('/api/order', isAuthenticatedUser, myOrder); // showing order to user
// router.get('/api/order/:id', isAuthenticatedUser, getOrderDetail);  // single order by orderId
router.get('/api/allOrders',isAuthenticatedUser,isAdmin,getAllOrders);

// Define routes for payments
// router.post('/', createPayment);
// router.get('/:paymentId', getPayment);
// router.put('/:paymentId', updatePayment);
// router.delete('/:paymentId', deletePayment);

// Define routes for product
router.post('/api/product',upload.single('image'), createProduct);
router.get('/api/product', getAllProduct);
router.get('/api/product/:id', getProductById);
router.put('/api/product/:id',upload.single('image'), updateProductById);
router.delete('/api/product/:id', deleteProductById);

// Define routes for review
router.put('/api/review/:productId', createReview);
router.get('/api/review/:productId', getAllReviewsOfSingleProduct);
router.delete('/api/review/:productId',isAuthenticatedUser,isAdmin, deleteProductReview);

export default router;