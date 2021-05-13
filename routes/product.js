const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Review = require('../models/review');
const { isLoggedIn } = require('../middleware');
const upload = require("../utils/multer");
const cloudinary = require("../utils/cloudinary");
const path = require("path");


// Display all the products
router.get('/products', async(req, res) => {
    
    try {
        const products=await Product.find({});
        res.render('products/index',{products}); 
    } catch (e) {
        console.log("Something Went Wrong");
        req.flash('error', 'Cannot Find Products');
        res.render('error');
    }
})


// Get the form for new product
router.get('/products/new',isLoggedIn, (req, res) => {

    res.render('products/new');
})


// Create New Product
router.post('/products',isLoggedIn, upload.single("productImg") ,async(req, res) => {

    try {
        const result = await cloudinary.uploader.upload(req.file.path);
        await Product.create({
            name:req.body.productName,
            img:result.secure_url,
            price:req.body.productPrice,
            desc:req.body.productDesc,
            cloudinary_id:result.public_id,
            seller_id:req.user._id
        });
        req.flash('success', 'Product Created Successfully');
        res.redirect('/products');
    }
    catch (e) {
        console.log(e.message);
        req.flash('error', 'Cannot Create Products,Something is Wrong');
        res.render('error');
    } 
});


// Show particular product
router.get('/products/:id', async(req, res) => {
    try {
        const product=await Product.findById(req.params.id).populate('reviews');
        res.render('products/show', { product});
    }
    catch (e) {
        console.log(e.message);
        req.flash('error', 'Cannot find this Product');
        res.redirect('/error');
    }
})

// Get the edit form
router.get('/products/:id/edit',isLoggedIn,async(req, res) => {

    try {
        const product=await Product.findById(req.params.id);
        res.render('products/edit',{product});
    }
    catch (e) {
        console.log(e.message);
        req.flash('error', 'Cannot Edit this Product');
        res.redirect('/error');
    }
})

// Upadate the particular product
router.patch('/products/:id',isLoggedIn,upload.single("productImg"),async(req, res) => {
    
    try {
        const {id}= req.params;
        const product = await Product.findById(id);
        await cloudinary.uploader.destroy(product.cloudinary_id);
        const result = await cloudinary.uploader.upload(req.file.path);
        const updatedProduct = {
            name:req.body.productName,
            img: result.secure_url,
            price:req.body.productPrice,
            desc:req.body.productDesc,
            cloudinary_id:result.public_id
        }
        await Product.findByIdAndUpdate(id,updatedProduct);
        req.flash('success', 'Updated Successfully!');
        res.redirect(`/products/${id}`) 
    }
    catch (e) {
        console.log(e.message);
        req.flash('error', 'Cannot update this Product');
        res.redirect('/error');
    }
})


// Delete a particular product
router.delete('/products/:id',isLoggedIn,async (req, res) => {

    try {
        const cloud=await Product.findById(req.params.id);
        await cloudinary.uploader.destroy(cloud.cloudinary_id);
        await Product.findByIdAndDelete(req.params.id);
        req.flash('success', 'Deleted the product successfully');
        res.redirect('/products');
    }
    catch (e) {
        console.log(e.message);
        req.flash('error', 'Cannot delete this Product');
        res.redirect('/error');
    }
})




// Creating a New Comment on a Product

router.post('/products/:id/review',isLoggedIn,async (req, res) => {
    
    try {
        const product = await Product.findById(req.params.id);


        const review = new Review({
            user: req.user.username,
            ...req.body
        });

        product.reviews.push(review);

        await review.save();
        await product.save();

        req.flash('success','Successfully added your review!')
        res.redirect(`/products/${req.params.id}`);
    }
    catch (e) {
        console.log(e.message);
        req.flash('error', 'Cannot add review to this Product');
        res.redirect('/error');
    }
    
})


router.get('/error', (req, res) => {
    res.status(404).render('error');
})


module.exports = router;