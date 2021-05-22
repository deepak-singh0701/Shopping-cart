const express = require("express");
const router = express.Router();
const request = require("request");
const { isLoggedIn } = require("../middleware");
const User = require("../models/user");
const Order = require("../models/order");
const Address = require("../models/address");
const Razorpay = require("razorpay");
require("dotenv").config();
const crypto = require("crypto");
const Product = require("../models/product");

let instance = new Razorpay({
  key_id: process.env.key_id,
  key_secret: process.env.key_secret,
});

router.post("/payment/address", isLoggedIn, async(req, res) => {
  if(req.user.address==null)
  res.render("address/address", { totalAmount: req.body.totalAmount });
  else{
    const user =await User.findById(req.user._id);
    const address = user.address;
    res.render("address/showaddress" , {address});
  }
});

router.post("/payment/address/change" , isLoggedIn , (req,res)=>{
  const totalAmount= req.body.totalAmount;
  res.render("address/address", {totalAmount});
});

router.post("/payment/savedaddress", isLoggedIn, async (req, res) => {
  try {
    const user = req.user;
    const addressdata = {
      name: req.body.name,
      phone: req.body.phone,
      pincode: req.body.pincode,
      state: req.body.state,
      city: req.body.city,
      hno: req.body.hno,
      colony: req.body.colony,
      landmark: req.body.landmark,
    };

    const totalAmount = parseInt(req.body.totalAmount);
    await User.findByIdAndUpdate(user._id, { address: addressdata });
    req.flash("success", "Address Added Succesfully!");
    res.render("address/showaddress", { address: addressdata, totalAmount });
  } catch (e) {
    console.log(e);
    req.flash(
      "error",
      "There was an error in saving your address , Please try again after sometime!."
    );
    res.redirect(`/user/${req.user._id}/cart`);
  }
});

router.post("/payment_gateway/order", isLoggedIn, async (req, res) => {
  try{
    const totalAmount = req.body.totalAmount + "00";
  var options = {
    amount: totalAmount,
    currency: "INR",
  };
  instance.orders.create(options, function (err, order) {
    if (err) {
      console.log(err);
    } else {
      const orderId = order.id;
      res.render("payment/payment", { totalAmount, orderId });
    }
  });}
  catch(e){
    req.flash('error' , 'There was an error in payment , Please try again!');
    res.redirect("/products");    
  }
});  

router.post("/payment/success", isLoggedIn, async (req, res) => {
  const hmac = crypto.createHmac("sha256", process.env.key_secret);
  hmac.update(req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id);
  let generated_signature = hmac.digest("hex");
  if (generated_signature == req.body.razorpay_signature) {
  }else{
    req.flash("Your Payment is Not Verified Please Try Again!")
    res.redirect("/products");
  }
  const user = req.user;
  try {
    var totalAmount = parseInt(req.body.amount);
    totalAmount= totalAmount/100;
    const order = {
      buyerid:req.user._id,
      payid: req.body.razorpay_payment_id,
      orderid:req.body.razorpay_order_id,
      signature:req.body.razorpay_signature,
      amount: totalAmount,
      orderedProducts: user.cart,
      address: user.address,
    };

    const placedOrder = await Order.create(order);

    req.user.orders.push(placedOrder);
    await req.user.cart==null;
    await req.user.save();

    req.flash(
      "success",
      "Your Order has been Successfully Placed.Thanks for Shopping with us!"
    );
    req.user.cart='';
    res.redirect(`/user/${req.user._id}/myOrders`);
  } catch (e) {
    console.log(e.message);
    req.flash(
      "error",
      "Cannot Place the Order at this moment.Please try again later!"
    );
    res.render("error");
  }
});

router.post("/payment/fail", isLoggedIn, (req, res) => {
  req.flash(
    "error",
    `Your Payment Failed.Try again after sometime ${req.body}`
  );
  res.render("error");
});

module.exports = router;
