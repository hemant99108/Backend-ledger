const mongoose=require("mongoose");


const ledgerSchema=new mongoose.Schema({
    account:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        required:[true,"ledger must be associated with an account"],
        index:true,
        immutable:true
    },
    amount:{
        type:Number,
        required:[true,"amount is required for ledger entry"],
        immutable:true
    },
    transaction:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"transaction",
        required:[true,"ledger must be associated with a transaction"],
        index:true,
        immutable:true,
    },
    type:{
        type:String,
        enum:{
            values:["CREDIT","DEBIT"],
            message:"type can either be CREDIT or DEBIT",   
        },
        required:[true,"ledger type is required"],
        immutable:true,
    }
})