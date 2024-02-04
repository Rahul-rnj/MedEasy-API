import asyncHandler from "express-async-handler";
import dotenv from 'dotenv';
dotenv.config();
import Order from "../models/Order.js";
import Stripe from "stripe";
import User from "../models/User.js";
import Product from "../models/Product.js"

//@desc create orders
//@route POST /api/v1/orders
//@access private

//stripe instance
const stripe = new Stripe(process.env.STRIPE_KEY);
export const createOrderCtrl = asyncHandler(async(req,res)=>{
   //Get the payload(customer, orderItems, shippingAddress, TotalPrice)
    const { orderItems, shippingAddress, totalPrice} = req.body
    
    //find the user
   const user = await User.findById(req.userAuthId);
   //check if user has shipping address 
   if(!user?.hasShippingAddress){
      throw new Error("Please provide shipping address");
   }
   //Check if order is not empty
   if(orderItems?.length <= 0){
      throw new Error("No Order Items");
   }
   //place/create order -- save into DB
   const order = await Order.create({
      user: user?._id,
      orderItems,
      shippingAddress,
      totalPrice,
   });
   console.log(order);

   //update the product qty
   const products = await Product.find({ _id: { $in: orderItems } });

  orderItems?.map(async (order) => {
    const product = products?.find((product) => {
      return product?._id?.toString() === order?._id?.toString();
    });
    if (product) {
      product.totalSold += order.qty;
    }
    await product.save();
  });
    //push order into user
    user.orders.push(order?.id);
    await user.save();

   //make payment(stripe)
   //convert order items to have same structure that stripe need
  const convertedOrders = orderItems.map((item) => {
   return {
     price_data: {
       currency: "inr",
       product_data: {
         name: item?.name,
         description: item?.description,
       },
       unit_amount: item?.price * 100,
     },
     quantity: item?.qty,
   };
 });
 const session = await stripe.checkout.sessions.create({
   line_items: convertedOrders,
   metadata: {
     orderId: JSON.stringify(order?._id),
   },
   mode: "payment",
   success_url: "http://localhost:3000/success",
   cancel_url: "http://localhost:3000/cancel",
 });
 res.send({ url: session.url });
});
   
//@desc get all orders
//@route GET /api/v1/orders
//@access PRIVATE

export const getAllordersCtrl = asyncHandler(async( req,res)=>{
  //find all orders
  const orders = await Order.find();
  res.json({
    success: true,
    message: "All Orders",
    orders,
  });
});

//@desc get single order
//@route GET api/v1/orders/:id
//@access private/admin

export const getSingleOrderCtrl = asyncHandler(async(req,res)=>{
  //get the id from params
  const id = req.params.id;
  const order = await Order.findById(id);
  //send response

  res.status(200).json({
    success: true,
    message: "Single Order",
    order,
  });
});

//@desc update order to delivered
//@route PUT /api/v1/orders/update/:id
//@access private/admin

export const updateOrderCtrl = asyncHandler(async (req, res) => {
  //get the id from params
  const id = req.params.id;
  //update
  const updatedOrder = await Order.findByIdAndUpdate(
    id,
    {
      status: req.body.status,
    },
    {
      new: true,
    }
  );
  res.status(200).json({
    success: true,
    message: "Order updated",
    updatedOrder,
  });
});

//@desc get sales sum of orders
//@route GET /api/v1/orders/sales/sum
//@access private/admin

export const getOrderStatsCtrl = asyncHandler(async (req, res) => {
  //get order stats
  const orders = await Order.aggregate([
    {
      $group: {
        _id: null,
        minimumSale: {
          $min: "$totalPrice",
        },
        totalSales: {
          $sum: "$totalPrice",
        },
        maxSale: {
          $max: "$totalPrice",
        },
        avgSale: {
          $avg: "$totalPrice",
        },
      },
    },
  ]);
  //get the date
  const date = new Date();
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const saleToday = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: today,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalSales: {
          $sum: "$totalPrice",
        },
      },
    },
  ]);
  //send response
  res.status(200).json({
    success: true,
    message: "Sum of orders",
    orders,
    saleToday,
  });
});

