const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");
const emailService = require("../services/email.service");
const accountModel = require("../models/account.model");
const mongoose = require("mongoose");

/**
 * - Create a new transaction
 * THE 10-STEP TRANSFER FLOW:
 * 1. Validate request
 * 2. Validate idempotency key
 * 3. Check account status
 * 4. Derive sender balance from ledger
 * 5. Create transaction (PENDING)
 * 6. Create DEBIT ledger entry
 * 7. Create CREDIT ledger entry
 * 8. Mark transaction COMPLETED
 * 9. Commit MongoDB session
 * 10. Send email notification
 */

async function createTransaction(req, res) {
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message:
                "fromAccount toAccount amount and idempotencyKey are required for a transaction",
        });
    }

    const fromUserAccount = await accountModel.findOne({ _id: fromAccount });
    const toUserAccount = await accountModel.findOne({ _id: toAccount });

    if (!fromUserAccount || !toUserAccount) {
        return res.status(401).json({
            message: "invalid fromUserAccount or toUserAccount",
        });
    }

    //2. validate idempotency key -> don`t replicate transactions at all

    const transactionAlreadyExists = await transactionModel.findOne({
        idempotencyKey: idempotencyKey,
    });

    if (transactionAlreadyExists) {
        if (transactionAlreadyExists.status == "COMPLETED") {
            return res.status(200).json({
                message: "Transaction already processed ",
                transaction: transactionAlreadyExists,
            });
        }

        if (transactionAlreadyExists.status == "PENDING") {
            return res.status(200).json({
                message: "Transaction is in  processing  ",
            });
        }

        if (transactionAlreadyExists.status == "FAILED") {
            return res.status(500).json({
                message: "Transaction processing failed,Please retry",
            });
        }

        if (transactionAlreadyExists.status == "REVERSED") {
            return res.status(500).json({
                message: "Transaction was reversed , please retry",
            });
        }
    }

    /**
     *  check account status and transfer amount only if both side have ACTIVE status
     */

    if (
        fromUserAccount.status !== "ACTIVE" ||
        toUserAccount.status !== "ACTIVE"
    ) {
        return res.status(400).json({
            message:
                "Both fromUserAccount and toUserAccount should be in ACTIVE status to make any kind of transaction ",
        });
    }

    //4--> Derieve sender balance from ledger

    const balance = await fromUserAccount.getBalance();

    if (balance < amount) {
        return res.status(400).json({
            message: `Insufficient balance.Current balance is ${balance}, Requested amount is ${amount}`,
        });
    }

    //create transaction (PENDING)

    const session = await mongoose.startSession();
    session.startTransaction();

    const transaction = await transactionModel.create(
        {
            fromUserAccount,
            toUserAccount,
            amount,
            idempotencyKey,
            status: "PENDING",
        },
        { session },
    );

    //6 create debit and credit ledger entries to maintain the records of transaction

    const debitLedgerEntry = await ledgerModel.create(
        {
            account: fromAccount,
            amount: amount,
            transaction: transaction._id,
            type: "DEBIT",
        },
        { session },
    );

    const creditLedgerEntry = await ledgerModel.create(
        {
            account: toAccount,
            amount: amount,
            transaction: transaction._id,
            type: "CREDIT",
        },
        { session },
    );

    transaction.status = "COMPLETED";

    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    //finally send an email notification that transaction is successfully done 

        
}
