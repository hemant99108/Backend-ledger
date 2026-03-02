const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, "Email is required for creating user"],
            trim: true,
            lowercase: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                "Invalid email address",
            ],
            unique: [true, "email already exists "],
        },
        name: {
            type: String,
            required: [true, "name is required for creating an account"],
        },
        password: {
            type: String,
            required: [
                true,
                "Password is required for creating a user account",
            ],
            minlength: [6, "password should be atleast 6 chars long "],
            select: false,
        },
        systemUser:{
            type:Boolean,
            default:false,
            immutable:true,
            select:false,
        }
    },
    { timestamps: true },
);

userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }

    const hashed = await bcrypt.hash(this.password, 10);
    this.password = hashed;

    return;
});

userSchema.methods.comparePassword = async function (password) {

    console.log(password,this.password);
    return await bcrypt.compare(password, this.password);
};

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;
