const mongoose=require("mongoose");



const transactionSchema=new mongoose.Schema({

    fromAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        required:[true,"Transaction must be associated with a from account"],
        index:true,
    },
    toAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        required:[true,"Transaction must be associated with a from account"],
        index:true,
    },
    status:{
        type:String,
        enum:{
            values:["PENDING","COMPLETED","FAILED","REVERSED"],
            message:"status can be from pending completed,failed or reversed ",
        },
        default:"PENDING",  
    },
    amount:{
        type:Number,
        required:[true,"amount is required for creating a transaction"] ,
        min:[0,"amount can`t be negative "]
    },
    idempotencyKey:{
        type:String,
        required:[true,"idempotency key is required to do a transaction "],
        index:true,
        unique:true  
    }
},{ timestamps:true});




const transactionModel=mongoose.model("transaction",transactionSchema);


module.exports=transactionModel;