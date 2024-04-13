import couponModel from "../model/coupon.model.js";

// only access by admin to create new coupon
const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountAmount, validFrom, validUntil, isActive } = req.body;
    
    if( !code || !discountType || !discountAmount || !validFrom || !validUntil || !isActive ) return res.status(400).json({ message: 'Fill the data proper' });
    
    const existingCoupon = await couponModel.findOne({ code });
    if (existingCoupon) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const newCoupon = couponModel({
      code,
      discountType,
      discountAmount,
      validFrom,
      validUntil,
      isActive
    });

    const savedCoupon = await newCoupon.save();

    if (savedCoupon) return res.status(201).json({ coupon: savedCoupon });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// only access by admin to get all coupon
const getAllCoupon = async (req, res) => {
  try {
    const coupons = await couponModel.find();
    res.status(200).json({ coupons });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  };
};

// only access by admin to get a coupon
const getCouponById = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await couponModel.findById(id);

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    return res.status(200).json({ coupon });
  } catch (error) {
    if(error.name==="CastError") return res.status(404).json({ message: "Coupon not found" });
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// only access by admin to update a coupon
const updateCouponById = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;    
    delete update.code;
    const updatedCoupon = await couponModel.findByIdAndUpdate(id, update, { new: true });

    if (!updatedCoupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    res.status(200).json({ coupon: updatedCoupon });
  } catch (error) {
    if(error.name==="CastError") return res.status(404).json({ message: "Coupon not found" });
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  };
};

// only access by admin to delete a coupon
const deleteCouponById = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCoupon = await couponModel.findByIdAndDelete(id);
    if (!deletedCoupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    res.status(200).json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    if(error.name==="CastError") return res.status(404).json({ message: "Coupon not found" });
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export { createCoupon, getAllCoupon, getCouponById, updateCouponById, deleteCouponById };
