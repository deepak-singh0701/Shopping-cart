const mongoose = require('mongoose');
const Product = require('./product');
const addressSchema = require ('./address');

const orderSchema = new mongoose.Schema({
    buyerid:{
        type:String,
        require:true
    },
    payid: {
        type: String,
        required: true,
        unique:true
    },
    orderid:{
        type:String,
        required:true,
        uniquie:true
    },
    signature:{
        type:String,
        require:true,
        uniquie:true
    },
    amount: {
        type: String,
        required:true
    },
    date: {
        type: Date,
        default:Date.now
    },
    orderedProducts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:'Product',
        }
    ],
    address:{
        type:addressSchema,
        required :true 
    }
})

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;