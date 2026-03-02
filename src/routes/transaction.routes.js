const express=require('express');
const authMiddleware=require('../middleware/auth.middleware');
const transactionController=require("../controllers/transaction.controller");



const router=express.Router();


/**
 * -post /api/transaction/
 * -Create a new transaction
 */
router.post("/",authMiddleware.authMiddleware,transactionController.createTransaction);


/**
 * -post /api/transaction/system/initial-funds
 * -create initial funds to transact using system user
 */

 router.post("/system/initial-funds",authMiddleware.authSystemUserMiddleware,transactionController.createInitialFundsTransaction);

 


module.exports=router;

