const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    name:{
        type:String,
        required : true
    },
    phone:{
        type:Number,
        required:true
    },
    pincode:{
        type:Number,
        required:true
    },
    state:{
        type:String,
        required:true
    },
    city:{
        type:String,
        required:true
    },
    hno:String,
    colony:{
        type:String,
        required:true
    },
    landmark:String
});

module.exports=addressSchema;