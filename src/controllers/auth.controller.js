
const jwt = require("jsonwebtoken");
const userModel=require("../models/user.model");

const emailService=require('../services/email.service')


/**
 * - user register controller 
 * - /api/auth/register 
 */

async function userRegisterController(req,res){

    const {email,name, password}=req.body;

    const exits=await userModel.findOne({
        email:email
    })

    if(exits){
        return res.status(422).json({
            message:"user already exits with this email",
            status:"failed"
        })
    }

    //if not exits then create a user 

    const user=await userModel.create({
        email,name,password
    })
    

    //to maintain current login of user 
    const token=await jwt.sign({userId:user._id},process.env.JWT_SECRET,{expiresIn:"3d"});


    res.cookie("token",token);

    res.status(201).json({
        user:{
            _id:user._id,
            email:user.email,
            name:user.name
        }
    });

    //after sending the response we`ll send the mail to the user about this registration 
    // await emailService.sendRegistrationEmail(user.email,user.name);

}


/**
 * -user login controller 
 * - /api/auth/login
 */

async function userLoginController(req,res){
    const {email,password}=req.body;

    const user=await userModel.findOne({email:email}).select("+password ");

    if(!user){
        return res.status(401).json({
            message:"email or password is invalid "
        })
    }

    const isValidPassword = await user.comparePassword(password);    
    
    if(!isValidPassword){
        return res.status(401).json({
            message:"email or password is invalid "
        })
    }
    
    console.log(password);

    const token=jwt.sign({userId:user._id},process.env.JWT_SECRET,{expiresIn:'3d'});

    res.cookie("token",token);

    res.status(200).json({
        message:"user logged in successfully",
        user:{
            name:user.name,
            email:user.email 
        }
    })

}


module.exports={
    userRegisterController,
    userLoginController,
}

