"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportReconciliation = exports.getReconciliation = exports.createPayout = exports.getAllPayouts = exports.updateBeneficiary = exports.createBeneficiary = exports.getBeneficiaries = void 0;
const mestaService_1 = require("../services/mestaService");
const Organization = require("../models/Organization");
const Beneficiary = require("../models/Beneficiary");
const Payout = require("../models/Payout");

// Get all beneficiaries for the logged-in user's organization
const getBeneficiaries = async (req, res) => {
    try {
        const user = req.user;
        const organization = await Organization.findOne({ userId: user._id });
        if (!organization) {
            return res.status(404).json({ message: 'Organization not found' });
        }
        const beneficiaries = await Beneficiary.find({ organizationId: organization._id })
            .sort({ createdAt: 'desc' });

        res.json(beneficiaries);
    }
    catch (error) {
        console.error('Get Beneficiaries Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getBeneficiaries = getBeneficiaries;

// Create a new beneficiary
const createBeneficiary = async (req, res) => {
    try {
        const user = req.user;
        const { name, email, currency, accountDetails } = req.body;
        const organization = await Organization.findOne({ userId: user._id });
        if (!organization)
            return res.status(404).json({ message: 'Organization not found' });

        // 1. Create in Mesta (or mock)
        const mestaBen = await (0, mestaService_1.createMestaBeneficiary)({ name, email, currency, accountDetails });

        // 2. Save to DB
        const beneficiary = await Beneficiary.create({
            organizationId: organization._id,
            name,
            email,
            currency,
            accountDetails: JSON.stringify(accountDetails), // stored as string
            mestaBeneficiaryId: mestaBen.id,
        });

        res.status(201).json(beneficiary);
    }
    catch (error) {
        console.error('Create Beneficiary Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.createBeneficiary = createBeneficiary;

// Update a beneficiary
const updateBeneficiary = async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;
        const { name } = req.body;

        const organization = await Organization.findOne({ userId: user._id });
        if (!organization)
            return res.status(404).json({ message: 'Organization not found' });

        // Verify beneficiary belongs to org
        const beneficiary = await Beneficiary.findOne({ _id: id, organizationId: organization._id });
        if (!beneficiary) {
            return res.status(404).json({ message: 'Beneficiary not found' });
        }

        // Update in DB
        beneficiary.name = name;
        await beneficiary.save();

        // TODO: Update in Mesta if supported/needed

        res.json(beneficiary);
    }
    catch (error) {
        console.error('Update Beneficiary Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updateBeneficiary = updateBeneficiary;

// Get all payouts (External + Internal SENT + Internal RECEIVED)
const getAllPayouts = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find organization first (for external payouts)
        const org = await Organization.findOne({ userId });

        const payouts = await Payout.find({
            $or: [
                // External Payouts from my Org
                { organizationId: org?._id },
                // Internal Sent
                { senderId: userId },
                // Internal Received
                { receiverId: userId }
            ]
        })
            .populate('beneficiaryId')
            .populate('senderId', 'name email')
            .populate('receiverId', 'name email')
            .sort({ createdAt: 'desc' });

        // Map to match frontend expectations if needed, basically handle populated fields
        const formattedPayouts = payouts.map(p => {
            const pObj = p.toObject();
            // Map populated fields back to what frontend might expect if different
            pObj.beneficiary = pObj.beneficiaryId;
            pObj.sender = pObj.senderId;
            pObj.receiver = pObj.receiverId;
            return pObj;
        });

        res.json(formattedPayouts);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching payouts', error: error.message });
    }
};
exports.getAllPayouts = getAllPayouts;

// Initiate Payout
const createPayout = async (req, res) => {
    try {
        const user = req.user;
        const { beneficiaryId, amount, currency, description } = req.body;

        const organization = await Organization.findOne({ userId: user._id });
        if (!organization)
            return res.status(404).json({ message: 'Organization not found' });

        const beneficiary = await Beneficiary.findById(beneficiaryId);
        if (!beneficiary)
            return res.status(404).json({ message: 'Beneficiary not found' });

        // 1. Initiate in Mesta
        const mestaOrder = await (0, mestaService_1.createMestaPayout)({
            beneficiaryId: beneficiary.mestaBeneficiaryId,
            amount,
            currency,
            description
        });

        // 2. Save to DB and Update Balance
        // Check balance
        if (organization.balance < amount) {
            throw new Error('Insufficient funds');
        }

        // Deduct Balance
        await Organization.findByIdAndUpdate(
            organization._id,
            { $inc: { balance: -amount } }
        );

        const payout = await Payout.create({
            organizationId: organization._id,
            beneficiaryId: beneficiary._id,
            amount,
            currency,
            status: 'PENDING',
            mestaPayoutId: mestaOrder.id,
            description,
        });

        // DEMO ONLY: Automatically complete payout after 10 seconds to simulate webhook
        setTimeout(async () => {
            try {
                await Payout.findByIdAndUpdate(payout._id, { status: 'COMPLETED' });
                console.log(`[DEMO] Automatically completed payout ${payout._id}`);
            } catch (err) {
                console.error('[DEMO] Failed to auto-complete payout', err);
            }
        }, 10000);

        res.status(201).json(payout);
    }
    catch (error) {
        console.error('Create Payout Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.createPayout = createPayout;

// Get Reconciliation Data
const getReconciliation = async (req, res) => {
    try {
        const userId = req.user._id;
        const org = await Organization.findOne({ userId });

        const payouts = await Payout.find({
            $or: [
                { organizationId: org?._id },
                { senderId: userId },
                { receiverId: userId }
            ]
        })
            .populate('beneficiaryId')
            .populate('senderId', 'name')
            .populate('receiverId', 'name')
            .sort({ createdAt: 'desc' });

        const reconciliationData = payouts.map(p => {
            const isInternal = p.type === 'INTERNAL';
            const isIncoming = isInternal && p.receiverId?._id?.toString() === userId.toString();

            return {
                id: p._id,
                date: p.createdAt,
                type: isIncoming ? 'CREDIT' : 'DEBIT',
                amount: p.amount,
                currency: p.currency,
                description: p.description,
                status: p.status,
                counterparty: isInternal
                    ? (isIncoming ? p.senderId?.name : p.receiverId?.name)
                    : p.beneficiaryId?.name,
                category: isInternal ? 'Internal Transfer' : 'External Payout'
            };
        });

        res.json(reconciliationData);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching reconciliation data', error });
    }
};
exports.getReconciliation = getReconciliation;

// Export Reconciliation CSV
const exportReconciliation = async (req, res) => {
    try {
        const userId = req.user._id;
        const org = await Organization.findOne({ userId });

        const payouts = await Payout.find({
            $or: [
                { organizationId: org?._id },
                { senderId: userId },
                { receiverId: userId }
            ]
        })
            .populate('beneficiaryId')
            .populate('senderId', 'name')
            .populate('receiverId', 'name')
            .sort({ createdAt: 'desc' });

        // Generate CSV
        const headers = ['Transaction ID', 'Date', 'Type', 'Amount', 'Currency', 'Status', 'Description', 'Counterparty', 'Category'];
        const rows = payouts.map(p => {
            const isInternal = p.type === 'INTERNAL';
            const isIncoming = isInternal && p.receiverId?._id?.toString() === userId.toString();

            const counterparty = isInternal
                ? (isIncoming ? p.senderId?.name : p.receiverId?.name)
                : p.beneficiaryId?.name;

            return [
                p._id,
                p.createdAt.toISOString(),
                isIncoming ? 'CREDIT' : 'DEBIT',
                p.amount,
                p.currency,
                p.status,
                `"${p.description || ''}"`, // Quote description to handle commas
                `"${counterparty || 'Unknown'}"`,
                isInternal ? 'Internal Transfer' : 'External Payout'
            ].join(',');
        });

        const csvContent = [headers.join(','), ...rows].join('\n');
        res.header('Content-Type', 'text/csv');
        res.attachment('reconciliation.csv');
        res.send(csvContent);
    }
    catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ message: 'Error exporting CSV' });
    }
};
exports.exportReconciliation = exportReconciliation;
