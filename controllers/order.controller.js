import orderModel from "../model/order.model.js";

// for user
const createOrder = async (req, res) => {
  try {
    const {
      shippingAddress,
      orderItems,
      phoneNumber,
      paymentDetail,
      shippingCharges,
      totalPrice,
    } = req.body;

    const newOrder = orderModel({
      shippingAddress,
      orderItems,
      phoneNumber,
      user: req.user._id,
      paidAt : Date.now(),
      paymentDetail,
      shippingCharges,
      totalPrice,
    });

    await newOrder.save();

    res
      .status(201)
      .json({ message: "Order created successfully", order: newOrder });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// for user
const getOrderDetail = async (req, res) => {
    try {
        const orderId = req.params.id;
        const order = await orderModel.findById(orderId).populate('user',"email name");
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({ order });
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// for user
const myOrder = async (req,res) => {
    try {
        const orders = await orderModel.find({ user : req.user._id});
        if(!orders) return res.status(404).json({message : "orders not found"});
        return res.status(200).json({message : "you orders are", orders});
    } catch (error) {
        console.error('Error fetching order of user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const getAllOrders = async (req,res) => {
    try {
        const orders = await orderModel.find();
        if(!orders) return res.status(404).json({message : "orders not found"});
        let total = 0;
        orders.forEach(order => {
            total = total+order.totalPrice;
        });
        return res.status(200).json({message : "you orders are", orders,total});
    } catch (error) {
        console.error('Error fetching order of user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const updateOrders = async (req,res) => {
    try {
        const order = await orderModel.findById(req.params.id);
        if(!order) return res.status(404).json({message: "order not found"});
        if(order.orderStatus === "delivered") return res.status(400).json({message : "this porduct is already delivered"});

        if (req.body.status === "Shipped") {
            order.orderItems.forEach(async (o) => {
                await updateStock(o.product, o.quantity);
            });
        }
          order.orderStatus = req.body.status;
        
          if (req.body.status === "Delivered") {
            order.deliveredAt = Date.now();
          }
        return res.status(200).json({message : "Update order successfully",});
    } catch (error) {
        console.error('Error fetching order of user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}



export {createOrder, getOrderDetail, myOrder, getAllOrders};