const mongoose = require('mongoose');

const beneficiarySchema = new mongoose.Schema({
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    name: { type: String, required: true },
    email: { type: String },
    currency: { type: String, required: true },
    accountDetails: { type: String, required: true }, // Storing as string to match previous implementation
    mestaBeneficiaryId: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Beneficiary', beneficiarySchema);
