

const mongoose=require('mongoose');



const accountSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:[true,"account must be associated with a user"],
        index:true
    },
    status:{
        type:String,
        enum:{
            values:["ACTIVE","FROZEN","CLOSED"],
            message:"status can be either active frozen or closed ",
        },
        default:"ACTIVE"
    },
    currency:{
        type:String,
        required:[true,"Currency is required for using an account"],
        default:"INR",
    }
},{timestamps:true});


//compound indexing for also we can search based on status of the accounts 
accountSchema.index({user:1,status:1}); 


const accountModel=mongoose.model("account",accountSchema);

module.exports=accountModel;