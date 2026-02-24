
const express=require('express');
const authMiddleware = require("../middleware/auth.middleware");
const accountController=require('../controllers/account.controller');



const router=express.Router();


/**
 * -Post /api/account
 * -Creates a new account for logged in user 
 * -protected route with authmiddleware 
 */


router.post('/',authMiddleware.authMiddleware,accountController.createAccountController);




module.exports=router;