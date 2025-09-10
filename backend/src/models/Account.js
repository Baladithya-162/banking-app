import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const transactionSchema = new mongoose.Schema({
    txnId: {
        type: String, required: true,
        unique: true
    },
    type: { type: String, 
        enum: ["transfer","withdraw", "deposit"],
         required: true },
    amount: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, enum: ["pending", "completed", "failed"], default: "completed" },

})
const AccountSchema = new mongoose.Schema({
    accountNumber: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["savings", "checking"], required: true },
    balance: { type: Number,required:true, default: 0 },
    status: { type: String, enum: ["active", "inactive", "closed"], default: "active" },
    transactions: [transactionSchema],
})
export const Account = mongoose.model("Account", AccountSchema);
export const Transaction = mongoose.model("Transaction", transactionSchema);