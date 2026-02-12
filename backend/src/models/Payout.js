const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    status: { type: String, default: 'PENDING', enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'] },
    description: { type: String },
    type: { type: String, default: 'EXTERNAL', enum: ['EXTERNAL', 'INTERNAL'] },

    // External Transfer
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    beneficiaryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Beneficiary' },

    // Internal Transfer
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    mestaPayoutId: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Payout', payoutSchema);
