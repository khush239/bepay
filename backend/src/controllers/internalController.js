"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deposit = exports.internalTransfer = exports.updateBankingDetails = void 0;
const User = require("../models/User");
const Organization = require("../models/Organization");
const Payout = require("../models/Payout");

// Add Banking Details
const updateBankingDetails = async (req, res) => {
    try {
        const userId = req.user._id;
        const { accountNumber, bankName } = req.body;
        if (!accountNumber || !bankName) {
            return res.status(400).json({ message: 'Account Number and Bank Name are required' });
        }
        // Check if account number is unique
        const existing = await User.findOne({ accountNumber });
        if (existing && existing._id.toString() !== userId.toString()) {
            return res.status(400).json({ message: 'Account Number already in use' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { accountNumber, bankName },
            { new: true }
        );
        res.json(updatedUser);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating banking details', error });
    }
};
exports.updateBankingDetails = updateBankingDetails;

// Internal Transfer
const internalTransfer = async (req, res) => {
    try {
        const senderId = req.user._id;
        const { receiverAccountNumber, amount, description } = req.body;
        const numAmount = Number(amount);
        if (!receiverAccountNumber || !numAmount || numAmount <= 0) {
            return res.status(400).json({ message: 'Invalid payload' });
        }

        // 1. Check Sender KYC - Populate organization to check kycStatus
        // Actually, we can just find the organization directly
        const senderOrg = await Organization.findOne({ userId: senderId });

        if (senderOrg?.kycStatus !== 'VERIFIED') {
            return res.status(403).json({ message: 'KYC not verified. Cannot initiate transfer.' });
        }

        // 2. Find Receiver
        const receiver = await User.findOne({ accountNumber: receiverAccountNumber });
        if (!receiver) {
            return res.status(404).json({ message: 'Receiver account not found' });
        }
        if (receiver._id.toString() === senderId.toString()) {
            return res.status(400).json({ message: 'Cannot transfer to self' });
        }

        // 3. Create Transaction (Sequential updates instead of Transaction for standalone MongoDB support)

        // Check sender balance (re-fetch for safety)
        if (!senderOrg || senderOrg.balance < numAmount) {
            throw new Error('Insufficient funds');
        }

        // Deduct from sender
        await Organization.findOneAndUpdate(
            { userId: senderId },
            { $inc: { balance: -numAmount } }
        );

        // Add to receiver's organization (if they have one)
        const receiverOrg = await Organization.findOne({ userId: receiver._id });
        if (receiverOrg) {
            await Organization.findOneAndUpdate(
                { userId: receiver._id },
                { $inc: { balance: numAmount } }
            );
        }

        // Create Payout record
        const transfer = await Payout.create({
            amount: numAmount,
            currency: 'USD',
            type: 'INTERNAL',
            status: 'COMPLETED', // Instant transfer
            description: description || 'Internal Transfer',
            senderId: senderId,
            receiverId: receiver._id,
        });

        res.json({ message: 'Transfer successful', transfer });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal transfer failed', error: error.message });
    }
};
exports.internalTransfer = internalTransfer;

// Deposit Funds
const deposit = async (req, res) => {
    try {
        const userId = req.user._id;
        const { amount } = req.body;
        const numAmount = Number(amount);
        if (!numAmount || numAmount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        // Update Balance
        const updatedOrg = await Organization.findOneAndUpdate(
            { userId: userId },
            { $inc: { balance: numAmount } },
            { new: true }
        );

        // Record Transaction
        await Payout.create({
            amount: numAmount,
            currency: 'USD',
            type: 'INTERNAL',
            status: 'COMPLETED',
            description: 'Wallet Deposit',
            receiverId: userId, // Money IN
        });

        res.json({ message: 'Deposit successful', balance: updatedOrg.balance });
    }
    catch (error) {
        console.error('Deposit error', error);
        res.status(500).json({ message: 'Deposit failed', error });
    }
};
exports.deposit = deposit;
