const express = require("express");
const router = express.Router();
const User = require("../models/user");
const {isVerified, isLoggedIn}= require("../middleware");


router.get("/register/merchant" , isLoggedIn , async(req,res)=>{
    const user = req.user;
    res.render("auth/merchantsignup", {user} )
});

router.post("/register/merchant" , isLoggedIn , async(req,res)=>{
    const user = req.user;
    await User.findByIdAndUpdate(user._id , {
        name:req.body.name,
        organisation:req.body.org,
        is_merchant:true
    })
    res.redirect("/products");
});


module.exports=router;