const express = require('express');
const router = express.Router();
const user = require("../models/user");
const { isLoggedIn } = require('../middleware');
const cloudinary = require("../utils/cloudinary");
const upload = require ("../utils/multer");
const path = require ("path");



router.get("/profile/:userId" ,isLoggedIn, (req,res)=>{
    const user = req.user;
    res.render("profile/profile" , {user});
}) 

router.get("/profile/update/propic" , isLoggedIn , (req,res)=>{
    const user = req.user;
    res.render("profile/updatepropic" , {user});
})

router.post("/profile/:userId",isLoggedIn,upload.single("propic"),async(req , res)=>{
    const user = req.user;
    if(user.cloudinary_id!=null){
        await cloudinary.uploader.destroy(user.cloudinary_id);
    }
    const result= await cloudinary.uploader.upload(req.file.path);
    user.cloudinary_id=result.public_id;
    user.profilepic= result.secure_url;
    await user.save();
    res.redirect(`/profile/${user._id}`);
})




module.exports=router;