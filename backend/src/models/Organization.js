const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    kycStatus: { type: String, default: 'PENDING', enum: ['PENDING', 'VERIFIED', 'REJECTED'] },
    kycData: { type: String },
    apiKey: { type: String, unique: true, sparse: true },
    mestaOrgId: { type: String },
    balance: { type: Number, default: 0.0 },
}, { timestamps: true });

module.exports = mongoose.model('Organization', organizationSchema);
