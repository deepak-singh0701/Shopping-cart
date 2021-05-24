const User = require ("./models/user");



const isLoggedIn = (req,res,next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You Need To Login First');
        return res.redirect('/login');
    }
    next();
}

const isVerified = async(req,res,next)=>{
    try{
        const user =await User.findOne({username:req.body.username});
        if(user==null || user ==undefined){
            req.flash("error", "No User Found With This Username");
            res.redirect("/login");   
        }
        else if(!user.is_verified){
            req.flash("error" , "Please verify your email first!. A mail with comfirmation link has already been send to your email.")
            setTimeout(()=>{
                User.findByIdAndRemove(user._id)},2000);
            res.redirect("/login");
        }else{

            next();
        }
    }
    catch(e){
        console.log(e);
        req.flash("error", "There was an error in signing you in please contact us at Customer Support")
    }
};

module.exports = {
    isLoggedIn , isVerified
}

