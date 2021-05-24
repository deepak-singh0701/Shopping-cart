const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");
const { session } = require("passport");
const crypto = require("crypto");
require('dotenv').config();
const nodemailer = require("nodemailer");
const {google} = require ("googleapis");
const { auth } = require("google-auth-library");
const {isVerified, isLoggedIn}= require("../middleware");

const CLIENT_ID=process.env.CLIENT_ID;
const CLIENT_SECRET=process.env.CLIENT_SECRET;
const REDIRECT_URI=process.env.REDIRECT_URI;
const REFRESH_TOKEN=process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID , CLIENT_SECRET , REDIRECT_URI)
oAuth2Client.setCredentials({refresh_token: REFRESH_TOKEN});

//sending mail
async function sendMail(mailOptions){
  try{
    const accessToken= await oAuth2Client.getAccessToken();
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth:{
        type:'OAuth2',
        user:"deepak0701singh@gmail.com",
        clientId:CLIENT_ID,
        clientSecret:CLIENT_SECRET,
        refreshToken:REFRESH_TOKEN,
        accessToken:accessToken
      }
    })

    const result = await transport.sendMail(mailOptions);
    return result;
  
  }
  catch(e)
  {
    return e;
  }
}




// Get the signup form
router.get("/register",(req, res) => {
  res.render("auth/signup");
});

router.post("/register", async (req, res) => {
  try {
    const emailToken=crypto.randomBytes(64).toString("hex")
    const newUser = new User({
      username:req.body.username,
      email: req.body.email,
      email_token: emailToken ,
      is_verified: false,
    });
    await User.register(
      newUser,
      req.body.password,
      async (err, user) => {
        if (err) {
          req.flash("error", err.message);
          return res.redirect("/register");
        }
        const mailOptions = {
          to:req.body.email,
          from:"E-commerce <deepak0709singh@gmail.com>" ,
          subject:"Email Verification" ,
          text:
          `Hello , Thanks for Registering On Our Site ,
          please copy and paste the address below to verify your account ,
          http://${req.headers.host}/verify-email?token=${user.email_token}`,
          html:
          `<h1>Hello ,</h1>
          <p>Please click on the link below to verify your account</p>
          <a href="http://${req.headers.host}/verify-email?token=${user.email_token}">Verify Your Account</a>`
        };

        try{
          await sendMail(mailOptions).then((result) => {console.log("Email Sent!" , result)})
          .catch(error=>console.log(error))
            req.flash("success" , `Please verify your email , a mail with confirmation link has been send to the registered email address` );
            res.redirect("/login");
        }
        catch(e){
            console.log(e);
            req.flash("error" , e.message);
        }
    }
    );
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/register");
  }
});


//Email Verification route
router.get("/verify-email" , async(req,res,next)=>{
    try{
        const user = await User.findOne({email_token:req.query.token});
        if(!user){
            req.flash("error" , "Wrong Token Please Contact Us For Assistance.")
            return res.redirect("/");
        }
        user.email_token=null;
        user.is_verified=true;
        await user.save();
        await req.login(user , async (err)=>{
            if(err){
                return next(err);
            }
            req.flash("success", `Welcome ${user.username}`);
            res.redirect("/products");
        });
    }
    catch(e){
        console.log(e);
        req.flash("error" , e.message);
        res.redirect("/register");
    }
} );



// Get the login form
router.get("/login", async (req, res) => {
  res.render("auth/login");
});

router.post(
  "/login",isVerified,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success", `Welcome Back!! ${req.user.username}`);
    res.redirect("/products");
  }
);

// Logout the user from the current session
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success", "Logged Out Successfully");
  res.redirect("/login");
});

module.exports = router;
