const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Product = require('./product');
const Order = require ('./order');
const addressSchema = require ('./address');


const userSchema = new mongoose.Schema({
    name:String,
    profilepic:{
        type:String,
        default:"https://t4.ftcdn.net/jpg/00/64/67/63/360_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.jpg"
    },
    cloudinary_id:{
        type:String
    },
    email: {
        type: String,
        required: true,
        unique:true
    },
    cart: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:'Product'
        }
    ],
    email_token:String,
    is_verified:{
        type:Boolean,
        default:false
    },
    organisation:String,
    is_merchant:{
        type:Boolean,
        default:false
    },
    orders: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:'Order'
        }
    ],
    address:{
        type:addressSchema
    }
})

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', userSchema);

module.exports = User;