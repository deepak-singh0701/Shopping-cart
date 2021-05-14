const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { isLoggedIn } = require("../middleware");
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const path = require("path");

router.get("/profile/:userId", isLoggedIn, (req, res) => {
  const user = req.user;
  res.render("profile/profile", { user });
});

router.get("/user/:userID/myOrders", isLoggedIn, async(req, res) => {
  try {
    const userInfo = await User.findById(req.params.userID).populate({
      path: "orders",
      populate: {
        path: "orderedProducts",
        model: "Product",
      },
    });
    if(userInfo.orderedProducts==null){
      const user = req.user;
      req.flash("error", "You Have No Orders! , Please Order Something To View It In Your Order List.");
      res.redirect("/products");
    }
    else{
    res.render("profile/myorders", { orders: userInfo.orderedProducts });
    }
  } catch (e) {
    console.log(e.message);
    req.flash(
      "error",
      "Cannot Place the Order at this moment.Please try again later!"
    );
    res.render("error");
  }
});

router.get("/profile/update/propic", isLoggedIn, (req, res) => {
  const user = req.user;
  res.render("profile/updatepropic", { user });
});

router.post(
  "/profile/:userId",
  isLoggedIn,
  upload.single("propic"),
  async (req, res) => {
    const user = req.user;
    if (user.cloudinary_id != null) {
      await cloudinary.uploader.destroy(User.cloudinary_id);
    }
    const result = await cloudinary.uploader.upload(req.file.path);
    User.cloudinary_id = result.public_id;
    User.profilepic = result.secure_url;
    await user.save();
    res.redirect(`/profile/${user._id}`);
  }
);

module.exports = router;
