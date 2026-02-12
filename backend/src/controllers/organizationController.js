"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitKyc = exports.updateOrganization = exports.getOrganization = void 0;
const Organization = require("../models/Organization");
const User = require("../models/User");

const getOrganization = async (req, res) => {
    try {
        const user = req.user;
        const organization = await Organization.findOne({ userId: user._id });

        if (!organization) {
            return res.status(404).json({ message: 'Organization not found' });
        }

        // Populate user details if needed, similar to include: { user: ... }
        // await organization.populate('userId', 'email name');

        res.json(organization);
    }
    catch (error) {
        console.error('Get Organization Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getOrganization = getOrganization;

const updateOrganization = async (req, res) => {
    try {
        const user = req.user;
        const { name, mestaOrgId } = req.body;

        const organization = await Organization.findOneAndUpdate(
            { userId: user._id },
            { name, mestaOrgId },
            { new: true }
        );

        res.json(organization);
    }
    catch (error) {
        console.error('Update Organization Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updateOrganization = updateOrganization;

const submitKyc = async (req, res) => {
    try {
        const user = req.user;
        // In a real app, this would handle file uploads or data sent to Mesta
        const { documentType, documentNumber } = req.body;
        const kycData = JSON.stringify({ documentType, documentNumber, submittedAt: new Date() });

        const organization = await Organization.findOneAndUpdate(
            { userId: user._id },
            {
                kycStatus: 'VERIFIED', // Auto-verify for sandbox/demo purposes
                kycData: kycData
            },
            { new: true }
        );

        res.json({ message: 'KYC Submitted and Verified', organization });
    }
    catch (error) {
        console.error('KYC Submit Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.submitKyc = submitKyc;
