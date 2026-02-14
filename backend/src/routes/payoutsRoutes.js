"use strict";
const express = require("express");
const {
    getBeneficiaries,
    createBeneficiary,
    updateBeneficiary,
    getAllPayouts,
    createPayout,
    getReconciliation,
    exportReconciliation
} = require("../controllers/payoutsController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

// Beneficiaries
router.get('/beneficiaries', authenticate, getBeneficiaries);
router.post('/beneficiaries', authenticate, createBeneficiary);
router.put('/beneficiaries/:id', authenticate, updateBeneficiary);

// Routes
router.get('/', authenticate, getAllPayouts);
router.post('/', authenticate, createPayout);

// Reconciliation
router.get('/reconciliation', authenticate, getReconciliation);
router.get('/reconciliation/export', authenticate, exportReconciliation);

module.exports = router;
